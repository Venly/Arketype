import { WebDriver } from 'selenium-webdriver';
import { FaucetBtc } from '@/faucet/FaucetBtc';

export class Faucet {
    public static async getFaucetIfNeeded(browser: WebDriver, chain: string, balance: number, address: string): Promise<void> {

        switch (chain.toLowerCase()) {
            case 'bitcoin':
                if(balance < 0.01) {
                    return FaucetBtc.getFaucetBtc(browser, address);
                }
                break;
            case 'ethereum':
                break;
            case 'vechain':
                break;
            default:
                return Promise.resolve();
        }
    }
}