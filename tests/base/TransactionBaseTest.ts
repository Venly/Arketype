import { By, until } from 'selenium-webdriver';

import { BaseTestSuite } from './BaseTestSuite';

import jsonWallets from '../../testConfig/wallets.json';
import { Wallet }  from '@arkane-network/arkane-connect';

export interface JsonWallet {
    'address': string,
    'description': string,
    'primary': false
}

export class TransactionBaseTest extends BaseTestSuite {
    protected static myWallets: Wallet[] = [] as Wallet[];
    protected static myJsonWallets: any = jsonWallets;

    protected get jsonWallets(): any {
        return TransactionBaseTest.myJsonWallets;
    }

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

    protected testWallet(jsonWallet: JsonWallet, minimumBalance: number = 0): void {
        const w: Wallet = this.getWallet(jsonWallet.address) as Wallet;
        this.assert.isTrue(typeof w !== 'undefined', `Wallet ${jsonWallet.address} - check if exists`);
        this.assert.equal(w.description, jsonWallet.description, `Wallet ${jsonWallet.address} - check description`);
        this.assert.equal(w.primary, jsonWallet.primary, `Wallet ${jsonWallet.address} - check primary`);
        if (minimumBalance > 0) {
            this.assert.isAbove(w.balance && w.balance.balance || 0, minimumBalance, `Wallet ${jsonWallet.address} - balance above ${minimumBalance}`);
        }
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

    private static async signFormVisible(): Promise<boolean> {
        return (await super.getBrowser().findElement(By.id('sign')).getCssValue('display')) === 'block';
    }
}