import { suite, test, timeout, slow } from 'mocha-typescript';
import { By, until, WebElement }             from 'selenium-webdriver';

import { BaseTestSuite } from '@/base/BaseTestSuite';

@suite(timeout(30000))
class ManageWalletsTest extends BaseTestSuite {

    protected static async before() {
        await super.before();
        // Goto manage wallets screen
        super.getBrowser().findElement(By.css('button.manage-wallets[data-chain="ETHEREUM"]')).click();
        await super.getBrowser().wait(until.elementLocated(By.css('#app.page')), 3000);
    }

    @test(timeout(2000), slow(200))
    public async hasArketypeInDescription() {
        await this.assert.eventually.equal(this.browser.findElement(By.css('.whitelabel-page__info')).getAttribute('innerHTML'), '<span>Please select your wallets <strong>Arketype</strong> is allowed to access.</span>');
    }

    @test(timeout(2000), slow(400))
    public async hasTwoActiveWalletsThatAreSelectable() {
        const walletCards: WebElement[] = await this.browser.findElements(By.css('.wallet-card.wallet-card--active'));
        await this.assert.equal(walletCards.length, 2, '2 Wallets connected');
        await walletCards[0].click();
        await this.assert.eventually.equal(walletCards[0].getAttribute('class'), 'wallet-card', 'Wallet Card deselected');
        await walletCards[0].click();
        await this.assert.eventually.equal(walletCards[0].getAttribute('class'), 'wallet-card wallet-card--active', 'Wallet Card selected');
    }

    @test(timeout(3000), slow(1600))
    public async canOpenAndCloseNewWalletWindow() {
        const newWalletLink: WebElement = await this.browser.findElement(By.css('.wallets__container + .text--right > .link'));
        await this.assert.eventually.equal(newWalletLink.getAttribute('innerHTML'), 'New Wallet', 'New Wallet link present.');
        await newWalletLink.click();

        const modal: WebElement = await this.browser.findElement(By.css('.modal-mask'));
        await this.assert.eventually.equal(modal.findElement(By.css('.modal__title')).getAttribute('innerHTML'), 'Confirmation Required', 'Modal opened after new wallet clicked.');

        const modalConfirmButton: WebElement = await modal.findElement(By.css('button[disabled="disabled"]'));
        await this.assert.eventually.equal(modalConfirmButton.getAttribute('innerHTML'), 'Confirm', 'Modal confirm button disabled with no pin entered');

        const pincode: WebElement = await modal.findElement(By.css('.control__input.control__input--pincode'));
        await pincode.sendKeys('8473');
        await this.assert.eventually.equal(modalConfirmButton.getAttribute('disabled'), null, 'Modal confirm button active after entering pin');

        const modalCancelButton: WebElement = await modal.findElement(By.css('button.btn.btn--muted.btn--outlined'));
        await this.assert.equal((await modalCancelButton.getText()).trim(), 'Cancel', 'Modal cancel Button Present');
        await modalCancelButton.click();

        await this.assert.eventually.isTrue(this.browser.wait(until.stalenessOf(modal), 750), 'Modal cancel clicked and Modal closed');
    }

    @test(timeout(4000), slow(2000))
    public async canCancel() {
        const cancelButton: WebElement = await this.browser.findElement(By.css('.dialog__content button.btn.btn--muted.btn--outlined'));
        this.assert.equal((await cancelButton.getText()).trim(), 'Cancel', 'Cancel Button Present');
        await cancelButton.click();
        await this.browser.wait(until.elementLocated(By.css('body#arketype')), 3000);
    }
}