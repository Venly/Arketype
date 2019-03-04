import { skipOnError, slow, suite, test, timeout } from 'mocha-typescript';

import { TransactionBaseTest } from './base/TransactionBaseTest';
import { Faucet }              from '@/faucet/Faucet';
import { By, WebElement }      from 'selenium-webdriver';

// Tests need to be done in correct order, and skipped when an error occurs
@suite(timeout(60000), skipOnError)
class VechainTransactionTest extends TransactionBaseTest {
    public chain: string = 'vechain';
    public currency: string = 'VET';
    public amount: string = '0.0012';
    public amountVisible: string = '0.001';
    public gasName: string = 'VTHO';
    public walletFromMinimumBalance: number = 10;
    public walletFrom = {
        'primary': true,
        'description': 'Wild Gharial',
        'address': '0xf5875417ccEb3aF5ef691374b49021Ce7c62A55f'
    };
    public walletTo = {
        'primary': false,
        'description': 'Otherworldly Seahorse',
        'address': '0x40a5a7DaAa2830317d5C3c3c79c059F1764a8832'
    };

    public checkFaucet() {
        return Faucet.getFaucetIfNeeded(
            this.browser,
            'vechain',
            this.getWalletBalance(this.walletFrom.address),
            this.walletFromMinimumBalance,
            this.walletFrom.address
        );
    }

    public async advancedOptions() {
        const fee = await this.getFee();
        await this.browser.findElement(By.css('.totals-box__settings-link')).click();
        await this.advancedCheckTotalBox();
        const gasLimitField: WebElement = await this.browser.findElement(By.css('#gas-limit'));
        const gasDefault: number = Number.parseFloat(await gasLimitField.getAttribute('value'));
        await gasLimitField.clear();
        await gasLimitField.sendKeys(gasDefault * 2);
        const gasHigh = Number.parseFloat(await gasLimitField.getAttribute('value'));
        await this.assert.isAbove(gasHigh, gasDefault, 'Set priority to fast');
        await this.browser.findElement(By.css('.advanced button.btn.btn--default')).click();
        const feeHigh = await this.getFee();
        await this.assert.isAbove(feeHigh, fee, 'Fee is higher after updating priority');
    }
}
