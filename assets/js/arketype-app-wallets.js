(function() {
    'use strict';

    $(function() {
        $(app).on('authenticated', function() {
            app.page.addConnectEvents('.get-app-wallets', getAppWallets);
            initGetAppWalletEvent();
            initCreateAppWalletEvent();
        });
    });

    function getAppWallets(el) {
        var secretType = el.dataset.chain.toUpperCase();
        window.arkaneConnect.api.getWallets({secretType: secretType, walletType: 'APPLICATION'}).then(function(wallets) {
            el.dataset.success = 'true';
            app.log(wallets, 'Application wallets ' + secretType);
            app.page.updateWallets(wallets, secretType)
        });
    }

    function initGetAppWalletEvent() {
        document.querySelectorAll('.get-app-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                getAppWallets(el);
            });
        });
    }

    function initCreateAppWalletEvent() {
        document.querySelectorAll('.create-app-wallet').forEach(function(el) {
            el.addEventListener('click', async function() {
                const signer = window.arkaneConnect.createSigner();
                const newWallet = await signer.confirm({
                                                           secretType: this.dataset.chain,
                                                           confirmationRequestType: 'CREATE_APPLICATION_WALLET'
                                                       });
                app.log(newWallet, "New wallet created");
            });
        });
    }
})();
