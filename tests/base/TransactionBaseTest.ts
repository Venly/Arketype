import { By, until } from 'selenium-webdriver';

import { BaseTestSuite } from './BaseTestSuite';

import { Wallet }              from '@arkane-network/arkane-connect';
import { slow, test, timeout } from 'mocha-typescript';
import { ErrorTypes }          from '@/base/ErrorTypes';

export interface JsonWallet {
    address: string,
    description: string,
    primary: boolean
}

export abstract class TransactionBaseTest extends BaseTestSuite {

    protected static myWallets: Wallet[] = [] as Wallet[];

    protected static async before(): Promise<void> {
        await super.before();
        const browser = super.getBrowser();
        // Check if wallets are available
        if (!await this.signFormVisible()) {
            await browser.findElement(By.id('get-wallets')).click();
            await browser.wait(until.elementIsVisible(browser.findElement(By.css('#sign'))), 3000);
        }
        // Save wallets to variable
        const w = await browser.findElement(By.css('body[data-wallets]')).getAttribute('data-wallets');
        TransactionBaseTest.myWallets = JSON.parse(w) as Wallet[];
    }

    private static async signFormVisible(): Promise<boolean> {
        return (await super.getBrowser().findElement(By.id('sign')).getCssValue('display')) === 'block';
    }

    public abstract chain: string;
    public abstract currency: string;
    public abstract amount: string;
    public abstract amountVisible?: string;
    public abstract gasName: string;
    public abstract walletFrom: JsonWallet;
    public abstract walletFromMinimumBalance: number;
    public abstract walletTo: JsonWallet;

    protected get wallets(): Wallet[] {
        return TransactionBaseTest.myWallets;
    }

    protected getWallet(walletAddress: string): Wallet | undefined {
        return this.wallets.find((w: Wallet) => w.address === walletAddress);
    }

    protected getWalletBalance(walletAddress: string): number {
        const w = this.wallets.find((w: Wallet) => w.address === walletAddress);
        return w && w.balance && w.balance.balance || 0;
    }

    public async abstract checkFaucet(): Promise<void>;

    @test()
    public async testToCheckFaucet() {
        await this.checkFaucet();
    }

    @test()
    public hasCorrectWallets() {
        this.testWallet(this.walletTo);
        this.testWallet(this.walletFrom, this.walletFromMinimumBalance);
    }

    @test(timeout(15000), slow(5000))
    public async checkFor_NO_WALLET_ID_FoundError() {
        await this.openTransactionWindow(this.chain, null, this.walletTo, this.amount);
        await this.checkErrorCodeAndCancelTransaction(ErrorTypes.NO_WALLET_ID);
    }

    @test(timeout(15000), slow(5000))
    public async checkFor_PREPARE_TRANSACTION_ERROR_TO_NotFoundError() {
        const walletTo = this.walletTo;
        walletTo.address = 'SomeBogusToAddress';
        await this.openTransactionWindow(this.chain, this.walletFrom, walletTo , this.amount);
        await this.checkErrorCodeAndCancelTransaction(ErrorTypes.PREPARE_TRANSACTION_ERROR_TO);
    }

    @test(timeout(15000), slow(8000))
    public async initiateAndCancelTransaction() {
        await this.openTransactionWindow(this.chain, this.walletFrom, this.walletTo, this.amount);
        await this.cancelTransaction();
    }

    @test(timeout(30000), slow(15000))
    public async doTransaction() {
        await this.openTransactionWindow(this.chain, this.walletFrom, this.walletTo, this.amount);

        const walletFromElement = await this.browser.findElement(By.css('.tx-pincode-form #wallet-from'));
        await this.assert.equal(
            (await walletFromElement.findElement(By.css('.wallet-card__description')).getText()).trim(),
            this.walletFrom.description,
            'Wallet From description'
        );
        await this.assert.equal((await walletFromElement.findElement(By.css('.wallet-card__address')).getText()).trim(), this.walletFrom.address, 'Wallet From address');
        const walletToElement = await this.browser.findElement(By.css('.tx-pincode-form #wallet-to'));
        await this.assert.equal((await walletToElement.findElement(By.css('.wallet-card__address')).getText()).trim(), this.walletTo.address, 'Wallet To address');
        await this.assert.equal(
            await this.browser.findElement(By.css('.tx-pincode-form .totals-box__amount .value')).getAttribute('innerHTML'),
            this.amountVisible,
            'Transaction Amount'
        );
        await this.assert.equal(
            await this.browser.findElement(By.css('.tx-pincode-form .totals-box__amount .currency')).getAttribute('innerHTML'),
            ' ' + this.currency,
            'Currency'
        );

        await this.advancedOptions();

        await this.confirmTransaction();
    }

    public abstract advancedOptions(): Promise<void>;

    protected testWallet(jsonWallet: JsonWallet, minimumBalance: number = 0): void {
        const w: Wallet = this.getWallet(jsonWallet.address) as Wallet;
        this.assert.isTrue(typeof w !== 'undefined', `Wallet ${jsonWallet.address} - check if exists`);
        this.assert.equal(w.description, jsonWallet.description, `Wallet ${jsonWallet.address} - check description`);
        this.assert.equal(w.primary, jsonWallet.primary, `Wallet ${jsonWallet.address} - check primary`);
        if (minimumBalance > 0) {
            this.assert.isAbove(w.balance && w.balance.balance || 0, minimumBalance, `Wallet ${jsonWallet.address} - balance above ${minimumBalance}`);
        }
    }

    protected async advancedOptionsSlider() {
        const fee = await this.getFee();
        await this.browser.findElement(By.css('.totals-box__settings-link')).click();
        await this.advancedCheckTotalBox();
        const tooltip = await this.browser.findElement(By.css('.advanced .vue-slider-tooltip'));
        const tooltipLabel = (await tooltip.getAttribute('innerHTML')).split(' ');
        await this.assert.equal(tooltipLabel[1], this.gasName, `Check if tooltip label is ${this.gasName}`);
        const gasDefault = Number.parseInt(tooltipLabel[0]);
        await this.browser.findElement(By.css('.advanced .vue-slider-piecewise-item:last-child > span')).click();
        const gasHigh = Number.parseInt((await tooltip.getAttribute('innerHTML')).split(' ')[0]);
        await this.assert.isAbove(gasHigh, gasDefault, 'Set priority to fast');
        await this.browser.findElement(By.css('.advanced button.btn.btn--default')).click();
        const feeHigh = await this.getFee();
        await this.assert.isAbove(feeHigh, fee, 'Fee is higher after updating priority');
    }

    protected async openTransactionWindow(chain: string, from: JsonWallet | null, to: JsonWallet, amount: string | number) {
        if (!await this.hasElement(`#exec-${chain}.collapse.show`)) {
            await this.browser.findElement(By.css(`[data-toggle][data-target="#exec-${chain}"]`)).click();
            await this.browser.wait(until.elementLocated(By.css(`#exec-${chain}.collapse.show`)), 1000);
        }
        const select = (await this.browser.findElement(By.css(`#exec-from-${chain}`)));
        await select.findElement(By.css(`option[data-address="${from ? from.address : ''}"]`)).click();
        await this.browser.findElement(By.css(`#exec-to-${chain}`)).clear();
        await this.browser.findElement(By.css(`#exec-to-${chain}`)).sendKeys(to.address);
        await this.browser.findElement(By.css(`#exec-amount-${chain}`)).clear();
        await this.browser.findElement(By.css(`#exec-amount-${chain}`)).sendKeys(amount);
        await this.browser.findElement(By.css(`#exec-${chain} button[type="submit"]`)).click();
        await this.browser.wait(until.elementLocated(By.css('#app.page')), 3000);
    }

    protected async confirmTransaction() {
        const confirmButton = await this.browser.findElement(By.css('button.btn.btn--default'));
        await this.assert.equal(await confirmButton.getAttribute('disabled'), 'true', 'Confirm button is disabled');
        await this.browser.findElement(By.css('input[type="password"]')).sendKeys(this.user.pincode);
        await this.assert.isNull(await confirmButton.getAttribute('disabled'), 'Confirm button is enabled');
        await confirmButton.click();
        await this.browser.wait(until.elementLocated(By.css('body#arketype.logged-in')), 10000);
        const url = new URL(await this.browser.getCurrentUrl());
        await this.assert.equal(url.searchParams.get('status'), 'SUCCESS', 'Status is SUCCESS');
        await this.assert.isNotEmpty(url.searchParams.get('transactionHash'), 'Has transaction hash');
    }

    protected async cancelTransaction() {
        const cancelButton = await this.browser.findElement(By.css('.tx-pincode-form .form__link-back'));
        await cancelButton.click();
        await this.browser.wait(until.elementLocated(By.css('body#arketype.logged-in')), 10000);
        const url = new URL(await this.browser.getCurrentUrl());
        await this.assert.equal(url.searchParams.get('status'), 'ABORTED', 'Status is ABORTED');
    }

    protected async checkErrorCodeAndCancelTransaction(errorCode: string) {
        const container = await this.browser.findElement(By.css('[data-error]'));
        await this.assert.equal(await container.getAttribute('data-error'), errorCode);
        const backButton = container.findElement(By.css('.btn.btn--danger'));
        await backButton.click();
        await this.browser.wait(until.elementLocated(By.css('body#arketype.logged-in')), 10000);
        const url = new URL(await this.browser.getCurrentUrl());
        await this.assert.equal(url.searchParams.get('status'), 'FAILED', 'Status is FAILED');
        await this.assert.equal(url.searchParams.get('error'), errorCode, `Error code is ${errorCode}`);
    }

    protected async getFee(): Promise<number> {
        return Number.parseFloat(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__fee .value')).getAttribute('innerHTML'));
    }

    protected async advancedCheckTotalBox(): Promise<void> {
        await this.assert.equal(await this.browser.findElement(By.css('.advanced h3')).getAttribute('innerHTML'), 'Advanced Settings', 'Title');
        await this.assert.equal(await this.browser.findElement(By.css('.advanced .totals-box__amount .value')).getAttribute('innerHTML'), this.amountVisible, 'Amount');
        await this.assert.equal(await this.browser.findElement(By.css('.advanced .totals-box__amount .currency')).getAttribute('innerHTML'), ' ' + this.currency, 'Currency');
    }

    protected async hasElement(cssSelector: string): Promise<boolean> {
        try {
            await this.browser.findElement(By.css(cssSelector));
            return true;
        } catch {
            return false;
        }
    }
}