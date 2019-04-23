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
        getWalletsBySecretType(secretType).then(function() {
            el.dataset.success = 'true';
        });
    }

    function getWalletsBySecretType(secretType) {
        return window.arkaneConnect.api.getWallets({secretType: secretType}).then(function(wallets) {
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
                var chain = this.dataset.chain;
                if(app.getWindowMode() === 'POPUP') {
                    window.arkaneConnect.manageWallets(chain).then((result) => {
                        app.log(result, 'manage-wallets finished');
                        getWalletsBySecretType(this.dataset.chain.toUpperCase());
                    }).catch((result) => {
                        app.error(result, 'manage-wallets');
                    });
                } else {
                    window.arkaneConnect.manageWallets(chain, {redirectUri: app.redirectUri, correlationID: `${Date.now()}`});
                }
            });
        });
    }

    function initLinkWalletsEvent() {
        document.getElementById('link-wallets').addEventListener('click', function() {
            if(app.getWindowMode() === 'POPUP') {
                window.arkaneConnect.linkWallets().then((result) => {
                    app.log(result, 'link-wallets finished');
                    var chain = document.querySelector('#nav-tabContent > .active').dataset.chain;
                    getWalletsBySecretType(chain.toUpperCase());
                }).catch((result) => {
                    app.error(result, 'link-wallets');
                });
            } else {
                window.arkaneConnect.linkWallets({redirectUri: app.redirectUri});
            }
        });
    }
})();
