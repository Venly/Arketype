import { assert }        from 'chai';
import { suite, test }   from 'mocha-typescript';
import { BaseTestSuite } from './base/BaseTestSuite';
import { Utils }         from './base/Utils';
import { By, WebDriver } from 'selenium-webdriver';

@suite
class Basic extends BaseTestSuite {
    private static driver: WebDriver;

    public static async before() {
        await super.before();
        await Utils.login(super.getDriver(), 'http://localhost:4000', super.getUser().login, super.getUser().password);

    }

    @test()
    public async loggedIn() {
        const driver = super.getDriver();
        const bodyClass: string[] = (await driver.findElement(By.id('arketype')).getAttribute('class')).split(' ');
        assert.isTrue(!!bodyClass.find((v: string) => v === 'logged-in'), 'Log into Arketype with Arkane.');
    }
}