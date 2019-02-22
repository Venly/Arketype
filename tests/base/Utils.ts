import { By, error, until, WebDriver, WebElement } from 'selenium-webdriver';
import NoSuchElementError = error.NoSuchElementError;

export class Utils {
    public static async login(browser: WebDriver, url: string, login: string, password: string): Promise<void> {
        await browser.get(url);
        await browser.wait(until.elementLocated(By.css('body#arketype')), 5000);

        try {
            let notLoggedIn: WebElement | void = await browser.findElement(By.css('body#arketype.not-logged-in')).catch((e: NoSuchElementError) => {});
            if (notLoggedIn) {
                await browser.wait(until.elementLocated(By.css('#auth-loginlink')), 3000);
                await browser.findElement(By.css('#auth-loginlink')).click();
                await browser.findElement(By.css('[name=username]')).sendKeys(login);
                await browser.findElement(By.css('[name=password]')).sendKeys(password);
                await browser.findElement(By.css('[name=login]')).click();
                await browser.wait(until.elementLocated(By.css('#arketype.logged-in')), 5000);
            } else {
                await browser.findElement(By.css('#arketype.logged-in'));
            }
        }
        catch (e) {
            throw e;
        }
    }
}