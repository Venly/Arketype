(function() {
    'use strict';

    $(function() {
        $(app).on('authenticated', function() {
            app.page.addConnectEvents('.get-wallets', getWallets);
            initGetWalletEvent();
            initManageWalletsEvent();
            initLinkWalletsEvent();
        });
    });

    function getWallets(el) {
        var secretType = el.dataset.chain.toUpperCase();
        window.arkaneConnect.api.getWallets({secretType: secretType}).then(function(wallets) {
            el.dataset.success = 'true';
            app.log(wallets, 'Wallets ' + secretType);
            app.page.updateWallets(wallets, secretType)
        });
    }

    function initGetWalletEvent() {
        document.querySelectorAll('.get-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                getWallets(el);
            });
        });
    }

    function initManageWalletsEvent() {
        document.querySelectorAll('.manage-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                window.arkaneConnect.manageWallets(this.dataset.chain, {redirectUri: app.redirectUri, correlationID: `${Date.now()}`});
            });
        });
    }

    function initLinkWalletsEvent() {
        document.getElementById('link-wallets').addEventListener('click', function() {
            window.arkaneConnect.linkWallets({redirectUri: app.redirectUri});
        });
    }
})();
