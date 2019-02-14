import { Config, Setup }  from './Setup';
import { Selenium }       from './Selenium';
import { WebDriver }      from 'selenium-webdriver';
import { BrowserConfigs } from '../../src/browser-configs/all';
import '../../src/fast-selenium.js';

export class BaseTestSuite {
    private static time: number;
    private static selenium: Selenium;
    private static staticDriver: WebDriver | undefined;
    private static config: Config;

    public getBrowser() {
        return BaseTestSuite.getBrowser();
    }

    public static getUser() {
        return BaseTestSuite.config && BaseTestSuite.config.userData && BaseTestSuite.config.userData.arkane;
    }

    public static getBrowser(): WebDriver {
        if (BaseTestSuite.staticDriver) {
            return BaseTestSuite.staticDriver as WebDriver;
        } else {
            throw Error('Driver not defined');
        }
    }

    public static async before() {
        BaseTestSuite.time = Date.now();
        BaseTestSuite.config = await Setup.getConfig();
        BaseTestSuite.selenium = new Selenium(BaseTestSuite.config.capabilities, BaseTestSuite.config.userData.browserstack, true);
        await BaseTestSuite.selenium.start(BrowserConfigs.MAC_CHROME);
        BaseTestSuite.staticDriver = await BaseTestSuite.selenium.createDriver();
        if (!BaseTestSuite.staticDriver) {
            throw new Error('Could not initialize Selenium');
        }
    }

    public static after() {
        if (BaseTestSuite.staticDriver) {
            BaseTestSuite.staticDriver.quit();
        }
        if (BaseTestSuite.selenium) {
            BaseTestSuite.selenium.stop()
        }
    }
}