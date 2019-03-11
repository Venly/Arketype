import { By, until, WebDriver } from 'selenium-webdriver';

export class FaucetBtc {

    public static async getFaucetBtc(browser: WebDriver, address: string) {
        await browser.get('https://coinfaucet.eu/en/btc-testnet/');

        if(await FaucetBtc.isFaucetBtcAvailable(browser)) {
            await browser.wait(until.elementLocated(By.css('input#address')), 5000);
            try {
                await browser.findElement(By.css('[name=address]')).sendKeys(address);
                await browser.findElement(By.css('#submit_button')).click();
            } catch(e) {
                throw e;
            }
        }
    }

    public static async isFaucetBtcAvailable(browser: WebDriver) {
        try {
            await browser.findElement(By.css('#Stage_jbeeb_3'));
            return false;
        } catch (e) {
            return true;
        }
    }
}