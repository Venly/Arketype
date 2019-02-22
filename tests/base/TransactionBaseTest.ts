import { By, until }  from 'selenium-webdriver';

import { BaseTestSuite } from './BaseTestSuite';

import jsonWallets from '../../testConfig/wallets.json';

export class TransactionBaseTest extends BaseTestSuite {
    protected wallets: any = jsonWallets;

    protected static async before(): Promise<void> {
        await super.before();
        const browser = super.getBrowser();
        if (!await this.signFormVisible()) {
            await browser.findElement(By.id('get-wallets')).click();
            await browser.wait(until.elementIsVisible(browser.findElement(By.css('#sign'))), 3000);
        }
    }

    private static async signFormVisible(): Promise<boolean> {
        return (await super.getBrowser().findElement(By.id('sign')).getCssValue('display')) === 'block';
    }
}