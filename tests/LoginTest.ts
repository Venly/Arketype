import chai            from 'chai';
import chaiAsPromised  from 'chai-as-promised';
import { suite, test } from 'mocha-typescript';
import { By, until }   from 'selenium-webdriver';

import { TransactionBaseTest } from './base/TransactionBaseTest';

chai.use(chaiAsPromised);
const assert = chai.assert;

@suite
class LoginTest extends TransactionBaseTest {

    @test()
    public async loggedIn() {
        await assert.isFulfilled(this.browser.wait(until.elementLocated(By.css('body#arketype.logged-in')), 1000));
    }

}