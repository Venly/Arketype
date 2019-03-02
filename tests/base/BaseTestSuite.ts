import { Config, Setup }  from './Setup';
import { Selenium }       from './Selenium';
import { WebDriver }      from 'selenium-webdriver';
import { BrowserConfigs } from '@config/browser-configs/all';
import { Utils }          from '@/base/Utils';
import chai               from 'chai';
import { context }        from 'mocha-typescript';
import axios              from 'axios';
import '@config/fast-selenium.js';
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

export class BaseTestSuite {
    @context
    public mocha!: any;

    private static time: number;
    private static selenium: Selenium;
    private static staticDriver: WebDriver;
    private static config: Config;
    private static errors: any[] = [];

    protected static get assert(): Chai.AssertStatic {
        return chai.assert;
    }

    protected static get expect(): Chai.ExpectStatic {
        return chai.expect;
    }

    protected get assert(): Chai.AssertStatic {
        return BaseTestSuite.assert;
    }

    protected get expect(): Chai.ExpectStatic {
        return BaseTestSuite.expect;
    }

    protected get browser(): WebDriver {
        return BaseTestSuite.getBrowser();
    }


    protected get user(): { login: string, password: string, pincode: string } {
        return BaseTestSuite.getUser();
    }

    protected static getBrowser(): WebDriver {
        return BaseTestSuite.staticDriver as WebDriver;
    }

    protected static async before(): Promise<void> {
        BaseTestSuite.time = Date.now();
        BaseTestSuite.config = await Setup.getConfig();
        BaseTestSuite.selenium = new Selenium(BaseTestSuite.config.capabilities, BaseTestSuite.config.userData.browserstack);
        await BaseTestSuite.selenium.start(BrowserConfigs.MAC_CHROME);
        BaseTestSuite.staticDriver = await BaseTestSuite.selenium.createDriver() as WebDriver;
        if (!BaseTestSuite.staticDriver) {
            throw new Error('Could not initialize Selenium');
        }
        await Utils.login(BaseTestSuite.getBrowser(), BaseTestSuite.config.url, BaseTestSuite.getUser().login, BaseTestSuite.getUser().password);
    }

    protected after(): void {
        const test = (this.mocha.currentTest as Mocha.Test);
        if (test.state !== 'passed') {
            BaseTestSuite.errors.push(`${test.title}: ${test.err && test.err.message}`);
        }
    }

    protected static async after(): Promise<void> {
        await BaseTestSuite.markTest();

        if (BaseTestSuite.staticDriver) {
            await BaseTestSuite.staticDriver.quit();
        }
        if (BaseTestSuite.selenium) {
            await BaseTestSuite.selenium.stop()
        }
    }

    private static getUser(): { login: string, password: string, pincode: string } {
        return BaseTestSuite.config && BaseTestSuite.config.userData && BaseTestSuite.config.userData.arkane;
    }

    private static async markTest(): Promise<void> {
        const session = await BaseTestSuite.getBrowser().getSession();
        const instance = axios.create({
            baseURL: `https://api.browserstack.com/automate/sessions/`,
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                'username': BaseTestSuite.config.userData.browserstack['browserstack.user'],
                'password': BaseTestSuite.config.userData.browserstack['browserstack.key']
            }
        });
        const data: any = {status: 'passed'};
        if (BaseTestSuite.errors.length > 0) {
            data.status = 'failed';
            data.reason = BaseTestSuite.errors
        }
        const response = await instance.put(`${session.getId()}.json`, data);
    }
}