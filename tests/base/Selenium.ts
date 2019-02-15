import { Builder, WebDriver } from 'selenium-webdriver';

import { Local as BsLocal } from 'browserstack-local';
import { BrowserConfig }    from '@config/browser-configs/all';

export class Selenium {
    private static readonly HUB: string = 'http://hub-cloud.browserstack.com/wd/hub';
    private readonly isLocal: boolean;
    private localBrowserStack: BsLocal = new BsLocal();
    private cap: any = null;
    private bsConfig: any = null;

    constructor(capabilities: any, browserstackUser: any, isLocal: boolean = true) {
        this.isLocal = isLocal;
        this.bsConfig = {
            'key': browserstackUser['browserstack.key'],
            'onlyAutomate': 'true',
        };
        if (this.isLocal) {
            this.bsConfig = Object.assign({}, this.bsConfig, {
                'binarypath': './testConfig/BrowserStackLocal',
                'localIdentifier': '',
            })
        }
        this.cap = Object.assign({}, capabilities, browserstackUser);
    }

    private async initDriver(cap: any): Promise<WebDriver | undefined> {
        let driver;
        try {
            driver = await new Builder().usingServer(Selenium.HUB).withCapabilities(cap).build();
        } catch (e) {
            console.error('error', e);
        }
        return driver;
    }

    public async createDriver(): Promise<WebDriver | undefined> {
        return this.initDriver(this.cap);
    }

    public async start(browserConfig: BrowserConfig): Promise<boolean> {
        this.cap = Object.assign({}, this.cap, browserConfig);

        try {
            if (this.isLocal) {
                console.info('***BS*** Local Url, starting BrowserStack Local');
                this.bsConfig.localIdentifier = `test-arketype-${browserConfig.name}`;
                this.cap = Object.assign({}, this.cap, {'browserstack.localIdentifier': this.bsConfig.localIdentifier});
                this.localBrowserStack = new BsLocal();
                await new Promise((resolve) => {
                    this.localBrowserStack.start(this.bsConfig, async () => {
                        console.info('***BS*** BrowserStack started: ', this.localBrowserStack.isRunning());
                        resolve(true);
                    });
                });
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    public stop() {
        if (this.isLocal && this.localBrowserStack) {
            this.localBrowserStack.stop(() => {
                console.info('***BS*** BrowserStack Local is stopped.');
            })
        }
    }
}