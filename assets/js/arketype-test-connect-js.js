(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};
    $(function() {
        $(app).on('authenticated', function() {
            app.log('Authenticated, ready for testing.')
        });
    });

    var wrap = function(fn, title) {
        return function() {
            try {
                app.startLoading();
                return fn.apply(this, arguments).then(function(x) {
                    app.stopLoading();
                    app.log(x, title);
                }).catch(function(ex) {
                    app.stopLoading();
                    app.error(ex, title);
                });
            } catch (ex) {
                app.stopLoading();
                app.error(ex, title);
            }
        };
    };

    Object.assign(app.page, {
        getAvailableSecretTypes: wrap(() => window.venlyConnect.api.getAvailableSecretTypes(), 'getAvailableSecretTypes'),
        getWallets: wrap((secretType) => window.venlyConnect.api.getWallets({secretType}), 'getWallets'),
        getWallet: wrap((walletId) => window.venlyConnect.api.getWallet(walletId), 'getWallet'),
        getNonfungibles: wrap((walletId) => window.venlyConnect.api.getNonfungibles(walletId), 'getNonfungibles'),
        unlink: wrap((walletId) => window.venlyConnect.api.unlink(walletId), 'unlink'),
        getBalance: wrap((walletId) => window.venlyConnect.api.getBalance(walletId), 'getBalance'),
        getTokenBalances: wrap((walletId) => window.venlyConnect.api.getTokenBalances(walletId), 'getTokenBalances'),
        getTokenBalance: wrap((walletId,
                               tokenAddress) => window.venlyConnect.api.getTokenBalance(walletId, tokenAddress), 'getTokenBalance'),
        getProfile: wrap(() => window.venlyConnect.api.getProfile(), 'getProfile'),
        getPendingTransactions: wrap(() => window.venlyConnect.api.getPendingTransactions(), 'getPendingTransactions'),
        deleteTransaction: wrap((transactionId) => window.venlyConnect.api.deleteTransaction(transactionId), 'deleteTransaction'),
        getTransactionStatus: wrap((transactionHash, secretType) => window.venlyConnect.api.getTransactionStatus(transactionHash, secretType), 'getTransactionStatus'),
    })

})();
