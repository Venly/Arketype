import { WebDriver } from 'selenium-webdriver';
import { FaucetBtc } from '@/faucet/FaucetBtc';
import { FaucetEth } from '@/faucet/FaucetEth';

export class Faucet {
    public static async getFaucetIfNeeded(browser: WebDriver, chain: string, balance: number, minBalance: number, address: string): Promise<void> {

        if(balance < minBalance) {
            switch (chain.toLowerCase()) {
                case 'bitcoin':
                    // return FaucetBtc.getFaucetBtc(browser, address);
                    break;
                case 'ethereum':
                    // return FaucetEth.getFaucetEth(browser, address);
                    break;
                case 'vechain':
                    // return FaucetVet.getFaucetVet(browser, address);
                    break;
                case 'gochain':
                    // return FaucetVet.getFaucetVet(browser, address);
                    break;
            }
        }

        return Promise.resolve();
    }
}