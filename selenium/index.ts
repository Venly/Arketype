import settings                                                       from './package.json';
import { Builder, By, ThenableWebDriver, until, WebElementCondition } from 'selenium-webdriver';
import user                                                           from './src/user.json';
import { browserConfigs }                                             from './src/browser-configs/all';
import './src/fast-selenium.js';

// Input capabilities
const capabilities = {
    'build': settings.version,
    'project': settings.name,
    'acceptSslCerts': 'true',
    'browserstack.networkLogs': 'true',
    'browserstack.local': 'true',
};

(async() => {
    let key = 'iphone';
    //for(let key of Object.keys(browserConfigs)) {
        const cap = Object.assign({}, capabilities, user.browserstack, browserConfigs[key]);
        cap['browserstack.localIdentifier'] = `test-arketype-${key.toLowerCase()}`;
        const driver = new Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(cap).build();

        //let x = await driver.get('https://selenium-arketype@mailinator.com:L7le%K&18NMnx3lsr939@login-qa.arkane.network/auth/realms/Arkane/protocol/openid-connect/token');
        try {
            await executeTest(driver);
        } catch(e) {
            console.log('error', e);
        } finally {
            driver.quit();
        }
    //}
})();

async function login (driver: ThenableWebDriver) {
    await driver.get('http://localhost:4000');
    await driver.sleep(500);
    let userid = await driver.findElement(By.id('auth-username')).getText();
    if(userid.toLowerCase() === 'anoniem') {
        await driver.wait(until.elementLocated(By.id('auth-loginlink')), 3000);
        await driver.findElement(By.id('auth-loginlink')).click();
        await driver.findElement(By.name('username')).sendKeys(user.arkane.login);
        await driver.findElement(By.name('password')).sendKeys(user.arkane.password);
        await driver.findElement(By.name('login')).click();
        await driver.wait(until.elementLocated(By.id('arketype')), 5000);
    }
}

async function executeTest(driver: ThenableWebDriver) {
    await login(driver);
    const title = await driver.getTitle();
    console.log(title);
}
