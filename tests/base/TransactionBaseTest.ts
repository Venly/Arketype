import { By, until } from 'selenium-webdriver';

import { BaseTestSuite } from './BaseTestSuite';

import { Wallet }              from '@arkane-network/arkane-connect';
import { slow, test, timeout } from "mocha-typescript";

export interface JsonWallet {
    'address': string,
    'description': string,
    'primary': boolean
}

export abstract class TransactionBaseTest extends BaseTestSuite {
    public abstract chain: string;
    public abstract currency: string;
    public abstract amount: string;
    public abstract amountVisible?: string;
    public abstract gasName: string;
    public abstract walletFrom: JsonWallet;
    public abstract walletFromMinimumBalance: number;
    public abstract walletTo: JsonWallet;

    protected static myWallets: Wallet[] = [] as Wallet[];

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

    public async abstract checkFaucet(): Promise<void>;

    @test()
    public async testToCheckFaucet() {
        await this.checkFaucet();
    }

    @test(timeout(10000), slow(4000))
    public async testToInitiateTransactionWindow() {
        await this.browser.findElement(By.css(`[data-toggle][data-target="#exec-${this.chain}"]`)).click();
        await this.browser.wait(until.elementLocated(By.css(`#exec-${this.chain}.collapse.show`)), 1000);
        await this.assert.equal(await this.browser.findElement(By.css(`#exec-from-${this.chain} option:first-child`)).getAttribute('innerHTML'), this.walletFrom.address);
        await this.browser.findElement(By.css(`#exec-to-${this.chain}`)).clear();
        await this.browser.findElement(By.css(`#exec-to-${this.chain}`)).sendKeys(this.walletTo.address);
        await this.browser.findElement(By.css(`#exec-amount-${this.chain}`)).clear();
        await this.browser.findElement(By.css(`#exec-amount-${this.chain}`)).sendKeys(this.amount);
        await this.browser.findElement(By.css(`#exec-${this.chain} button[type="submit"]`)).click();
        await this.browser.wait(until.elementLocated(By.css('#app.page')), 3000);
    }

    @test()
    public hasCorrectWallets() {
        this.testWallet(this.walletTo);
        this.testWallet(this.walletFrom, this.walletFromMinimumBalance);
    }

    @test(timeout(2000), slow(2000))
    public async transactionScreen() {
        const walletFromElement = this.browser.findElement(By.css('.tx-pincode-form #wallet-from'));
        await this.assert.equal((await walletFromElement.findElement(By.css('.wallet-card__description')).getText()).trim(), this.walletFrom.description, 'Wallet From description');
        await this.assert.equal((await walletFromElement.findElement(By.css('.wallet-card__address')).getText()).trim(), this.walletFrom.address, 'Wallet From address');
        const walletToElement = this.browser.findElement(By.css('.tx-pincode-form #wallet-to'));
        await this.assert.equal((await walletToElement.findElement(By.css('.wallet-card__address')).getText()).trim(), this.walletTo.address, 'Wallet To address');
        await this.assert.equal(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__amount .value')).getAttribute('innerHTML'), this.amountVisible, 'Transaction Amount');
        await this.assert.equal(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__amount .currency')).getAttribute('innerHTML'), ' ' + this.currency, 'Currency');
    }

    @test(timeout(4000), slow(2000))
    public async advancedOptions() {
        const fee = Number.parseFloat(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__fee .value')).getAttribute('innerHTML'));
        await this.browser.findElement(By.css('.totals-box__settings-link')).click();
        await this.assert.equal(await this.browser.findElement(By.css('.advanced h3')).getAttribute('innerHTML'), 'Advanced Settings', 'Title');
        await this.assert.equal(await this.browser.findElement(By.css('.advanced .totals-box__amount .value')).getAttribute('innerHTML'), this.amountVisible, 'Amount');
        await this.assert.equal(await this.browser.findElement(By.css('.advanced .totals-box__amount .currency')).getAttribute('innerHTML'), ' ' + this.currency, 'Currency');
        const tooltip = await this.browser.findElement(By.css('.advanced .vue-slider-tooltip'));
        const tooltipLabel = (await tooltip.getAttribute('innerHTML')).split(' ');
        await this.assert.equal(tooltipLabel[1], this.gasName, `Check if tooltip label is ${this.gasName}`);
        const gasDefault = Number.parseInt(tooltipLabel[0]);
        await this.browser.findElement(By.css('.advanced .vue-slider-piecewise-item:last-child')).click();
        const gasHigh = Number.parseInt((await tooltip.getAttribute('innerHTML')).split(' ')[0]);
        await this.assert.isAbove(gasHigh, gasDefault, 'Set priority to fast');
        await this.browser.findElement(By.css('.advanced button.btn.btn--default')).click();
        const feeHigh = Number.parseFloat(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__fee .value')).getAttribute('innerHTML'));
        await this.assert.isAbove(feeHigh, fee, 'Fee is higher after sliding to fast');
    }

    @test(timeout(12000), slow(6000))
    public async confirmTransaction() {
        const confirmButton = await this.browser.findElement(By.css('button.btn.btn--default'));
        await this.assert.equal(await confirmButton.getAttribute('disabled'), 'true', 'Confirm button is disabled');
        await this.browser.findElement(By.css('input[type="password"]')).sendKeys(this.user.pincode);
        await this.assert.isNull(await confirmButton.getAttribute('disabled'), 'Confirm button is enabled');
        // await confirmButton.click();
        // await this.browser.wait(until.elementLocated(By.css('body#arketype.logged-in')), 10000);
        // const url = new URL(await this.browser.getCurrentUrl());
        // await this.assert.equal(url.searchParams.get('status'), 'SUCCESS', 'Status is success');
        // await this.assert.isNotEmpty(url.searchParams.get('transactionHash'), 'Has transaction hash');
    }

    protected testWallet(jsonWallet: JsonWallet, minimumBalance: number = 0): void {
        const w: Wallet = this.getWallet(jsonWallet.address) as Wallet;
        this.assert.isTrue(typeof w !== 'undefined', `Wallet ${jsonWallet.address} - check if exists`);
        this.assert.equal(w.description, jsonWallet.description, `Wallet ${jsonWallet.address} - check description`);
        this.assert.equal(w.primary, jsonWallet.primary, `Wallet ${jsonWallet.address} - check primary`);
        if (minimumBalance > 0) {
            this.assert.isAbove(w.balance && w.balance.balance || 0, minimumBalance, `Wallet ${jsonWallet.address} - balance above ${minimumBalance}`);
        }
    }

    private static async signFormVisible(): Promise<boolean> {
        return (await super.getBrowser().findElement(By.id('sign')).getCssValue('display')) === 'block';
    }
}