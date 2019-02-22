import { suite, test }           from 'mocha-typescript';
import { By, until, WebElement } from 'selenium-webdriver';

import { TransactionBaseTest } from './base/TransactionBaseTest';

@suite
class EthereumTransactionTest extends TransactionBaseTest {

    @test()
    public async hasCorrectWallets() {
        await this.assert.eventually.equal(this.browser.findElement(By.css('#sign-from-eth option:first-child')).getAttribute('innerHTML'), this.wallets.ethereum[0].address);
    }

}