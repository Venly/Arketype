import { suite, test } from 'mocha-typescript';
import { By }          from 'selenium-webdriver';

import { TransactionBaseTest } from './base/TransactionBaseTest';

@suite
class EthereumTransactionTest extends TransactionBaseTest {

    // @test()
    // public async hasCorrectWallets() {
    //     await this.assert.equal(await  this.browser.findElement(By.css('#sign-from-eth option:first-child')).getAttribute('innerHTML'), this.jsonWallets.ethereum[0].address);
    // }

}