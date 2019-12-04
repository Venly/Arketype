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
        getAvailableSecretTypes: wrap(() => window.arkaneConnect.api.getAvailableSecretTypes(), 'getAvailableSecretTypes'),
        getWallets: wrap((secretType) => window.arkaneConnect.api.getWallets({secretType}), 'getWallets'),
        getWallet: wrap((walletId) => window.arkaneConnect.api.getWallet(walletId), 'getWallet'),
        getNonfungibles: wrap((walletId) => window.arkaneConnect.api.getNonfungibles(walletId), 'getNonfungibles'),
        unlink: wrap((walletId) => window.arkaneConnect.api.unlink(walletId), 'unlink'),
        getBalance: wrap((walletId) => window.arkaneConnect.api.getBalance(walletId), 'getBalance'),
        getTokenBalances: wrap((walletId) => window.arkaneConnect.api.getTokenBalances(walletId), 'getTokenBalances'),
        getTokenBalance: wrap((walletId,
                               tokenAddress) => window.arkaneConnect.api.getTokenBalance(walletId, tokenAddress), 'getTokenBalance'),
        getProfile: wrap(() => window.arkaneConnect.api.getProfile(), 'getProfile'),
        getPendingTransactions: wrap(() => window.arkaneConnect.api.getPendingTransactions(), 'getPendingTransactions'),
        deleteTransaction: wrap((transactionId) => window.arkaneConnect.api.deleteTransaction(transactionId), 'deleteTransaction'),
        getTransactionStatus: wrap((transactionHash, secretType) => window.arkaneConnect.api.getTransactionStatus(transactionHash, secretType), 'getTransactionStatus'),
    })

})();
