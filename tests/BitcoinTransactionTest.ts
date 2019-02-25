import { skipOnError, slow, suite, test, timeout } from 'mocha-typescript';
import { By, until }                               from 'selenium-webdriver';

import { TransactionBaseTest } from './base/TransactionBaseTest';

// Tests need to be done in correct order, and skipped when an error occurs
@suite(timeout(60000), skipOnError)
class BitcoinTransactionTest extends TransactionBaseTest {

    public static async before() {
        await super.before();
        // Start transaction with predefined values
        await super.getBrowser().findElement(By.css('[data-toggle][data-target="#exec-bitcoin"]')).click();
        await super.getBrowser().wait(until.elementLocated(By.css('#exec-bitcoin.collapse.show')), 1000);
        await this.assert.equal(await super.getBrowser().findElement(By.css('#exec-from-bitcoin option:first-child')).getAttribute('innerHTML'), TransactionBaseTest.myJsonWallets.bitcoin[1].address);
        await super.getBrowser().findElement(By.css('#exec-to-bitcoin')).clear();
        await super.getBrowser().findElement(By.css('#exec-to-bitcoin')).sendKeys(TransactionBaseTest.myJsonWallets.bitcoin[0].address);
        await super.getBrowser().findElement(By.css('#exec-amount-bitcoin')).clear();
        await super.getBrowser().findElement(By.css('#exec-amount-bitcoin')).sendKeys('0.000001');
        await super.getBrowser().findElement(By.css('#exec-bitcoin button[type="submit"]')).click();
        await super.getBrowser().wait(until.elementLocated(By.css('#app.page')), 3000);
    }

    @test()
    public hasCorrectWallets() {
        this.testWallet(this.jsonWallets.bitcoin[0]);
        this.testWallet(this.jsonWallets.bitcoin[1], 0.01);
    }

    @test(timeout(2000), slow(2000))
    public async transactionScreen() {
        const walletFrom = this.browser.findElement(By.css('.tx-pincode-form #wallet-from'));
        await this.assert.equal((await walletFrom.findElement(By.css('.wallet-card__description')).getText()).trim(), this.jsonWallets.bitcoin[1].description);
        await this.assert.equal((await walletFrom.findElement(By.css('.wallet-card__address')).getText()).trim(), this.jsonWallets.bitcoin[1].address);
        const walletTo = this.browser.findElement(By.css('.tx-pincode-form #wallet-to'));
        await this.assert.equal((await walletTo.findElement(By.css('.wallet-card__address')).getText()).trim(), this.jsonWallets.bitcoin[0].address);
        await this.assert.equal(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__amount .value')).getAttribute('innerHTML'), '0.000001');
        await this.assert.equal(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__amount .currency')).getAttribute('innerHTML'), ' BTC');

    }

    @test(timeout(4000), slow(2000))
    public async advancedOptions() {
        const fee = Number.parseFloat(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__fee .value')).getAttribute('innerHTML'));
        await this.browser.findElement(By.css('.totals-box__settings-link')).click();
        await this.assert.equal(await this.browser.findElement(By.css('.advanced h3')).getAttribute('innerHTML'), 'Advanced Settings');
        await this.assert.equal(await this.browser.findElement(By.css('.advanced .totals-box__amount .value')).getAttribute('innerHTML'), '0.000001');
        await this.assert.equal(await this.browser.findElement(By.css('.advanced .totals-box__amount .currency')).getAttribute('innerHTML'), ' BTC');
        const tooltip = await this.browser.findElement(By.css('.advanced .vue-slider-tooltip'));
        const satoshiDefault = Number.parseInt((await tooltip.getAttribute('innerHTML')).split(' ')[0]);
        await this.browser.findElement(By.css('.advanced .vue-slider-piecewise-item:last-child')).click();
        const satoshiHigh = Number.parseInt((await tooltip.getAttribute('innerHTML')).split(' ')[0]);
        await this.assert.isAbove(satoshiHigh, satoshiDefault);
        await this.browser.findElement(By.css('.advanced button.btn.btn--default')).click();
        const feeHigh = Number.parseFloat(await this.browser.findElement(By.css('.tx-pincode-form .totals-box__fee .value')).getAttribute('innerHTML'));
        await this.assert.isAbove(feeHigh, fee, 'Fee is higher because of higher priority');
    }

    @test(timeout(12000), slow(6000))
    public async confirmTransaction() {
        const confirmButton = await this.browser.findElement(By.css('button.btn.btn--default'));
        await this.assert.equal(await confirmButton.getAttribute('disabled'), 'true', 'Confirm button is disabled');
        await this.browser.findElement(By.css('input[type="password"]')).sendKeys(this.user.pincode);
        await this.assert.isNull(await confirmButton.getAttribute('disabled'), 'Confirm button is enabled');
        await confirmButton.click();
        await this.browser.wait(until.elementLocated(By.css('body#arketype.logged-in')), 10000);
        const url = new URL(await this.browser.getCurrentUrl());
        await this.assert.equal(url.searchParams.get('status'), 'SUCCESS', 'Status is success');
        await this.assert.isNotEmpty(url.searchParams.get('transactionHash'), 'Has transaction hash');
    }
}