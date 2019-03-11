import iphone from './iphone-8.json';
import macChrome from './mac-chrome.json';
import macSafari from './mac-safari.json';

export interface BrowserConfig {
    browserName?: string;
    device?: string;
    realMobile?: string;
    os?: string;
    os_version?: string;
    browser_version?: string;
    resolution?: string;
    chromeOptions?: any;
    name?: string
}

export class BrowserConfigs {
    public static get IPHONE() {
        return Object.assign({}, iphone, {name: 'iphone'});
    }
    public static get MAC_CHROME() {
        return Object.assign({}, macChrome, {name: 'mac-chrome'});
    }
    public static get MAC_SAFARI() {
        return Object.assign({}, macSafari, {name: 'mac-safari'});
    }
}
