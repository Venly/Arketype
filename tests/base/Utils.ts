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

    public static get env() {
        const x = {
            "browserstack": {
                "user": "stevemaris3",
                "key": "USChyZB6gAzHjfB5zqiV"
            },
            "arkane": {
                "login": "selenium-arketype@mailinator.com",
                "password": "L7le%K&18NMnx3lsr939",
                "pincode": "97531"
            }
        };

        return {
            BROWSERSTACK_USERNAME: process.env.BROWSERSTACK_USERNAME || x.browserstack.user,
            BROWSERSTACK_ACCESS_KEY: process.env.BROWSERSTACK_ACCESS_KEY || x.browserstack.key,
            BROWSERSTACK_LOCAL: process.env.BROWSERSTACK_LOCAL || 'true',
            BROWSERSTACK_BUILD: process.env.BROWSERSTACK_BUILD || 'local-1',
            ARKANE_USERNAME: process.env.ARKANE_USERNAME || x.arkane.login,
            ARKANE_PASSWORD: process.env.ARKANE_PASSWORD || x.arkane.password,
            ARKANE_PINCODE: process.env.ARKANE_PINCODE || x.arkane.pincode,
            TEST_URL: process.env.TEST_URL || 'http://localhost:4000',
        }
    }

    // private static async importIfExists(file: string): Promise<any> {
    //     try {
    //         return await require(file);
    //     } catch (e) {
    //         console.log('user.local.json not found');
    //         return;
    //     }
    // }
}