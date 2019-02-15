import chai            from 'chai';
import chaiAsPromised  from 'chai-as-promised';
import { suite, test } from 'mocha-typescript';
import { By, until }   from 'selenium-webdriver';

import { BaseTestSuite } from './base/BaseTestSuite';
import { Utils }         from './base/Utils';

import jsonWallets from '../testConfig/wallets.json';


chai.use(chaiAsPromised);
const assert = chai.assert;
const wallets: any = jsonWallets;

@suite
class TransactionTest extends BaseTestSuite {
    public static async before() {
        await super.before();
        await Utils.login(super.getBrowser(), 'http://localhost:4000', super.getUser().login, super.getUser().password);
    }

    public async signFormVisible(): Promise<boolean> {
        return (await super.getBrowser().findElement(By.id('sign')).getCssValue('display')) === 'block';
    }

    @test()
    public async loggedIn() {
        const browser = super.getBrowser();
        const bodyClass: string[] = (await browser.findElement(By.id('arketype')).getAttribute('class')).split(' ');
        assert.isTrue(!!bodyClass.find((v: string) => v === 'logged-in'), 'Log into Arketype with Arkane.');
    }

    @test()
    public async hasCorrectWallets() {
        const browser = super.getBrowser();
        if (!await this.signFormVisible()) {
            await browser.findElement(By.id('get-wallets')).click();
            await assert.isFulfilled(browser.wait(until.elementIsVisible(browser.findElement(By.id('sign'))), 3000));
        }
        await assert.eventually.equal(browser.findElement(By.xpath('//select[@id="sign-from-eth"]/option[1]')).getAttribute('innerHTML'), wallets.ethereum[0].address);
    }
}