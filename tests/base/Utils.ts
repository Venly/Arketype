import { By, until, WebDriver } from 'selenium-webdriver';

export class Utils {
    public static async login(driver: WebDriver, url: string, login: string, password: string) {
        await driver.get(url);
        await driver.sleep(500);
        let notLoggedIn = (await driver.findElement(By.id('arketype')).getAttribute('class')).indexOf('not-logged-in') > -1;
        if (notLoggedIn) {
            await driver.wait(until.elementLocated(By.id('auth-loginlink')), 3000);
            await driver.findElement(By.id('auth-loginlink')).click();
            await driver.findElement(By.name('username')).sendKeys(login);
            await driver.findElement(By.name('password')).sendKeys(password);
            await driver.findElement(By.name('login')).click();
            await driver.wait(until.elementLocated(By.id('arketype')), 5000);
        }
    }
}