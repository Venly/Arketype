(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};

    app.initApp = function() {
        window.arkaneConnect = new ArkaneConnect(app.clientId, {environment: app.environment.connect});

        document.getElementById('connect-with-arkane').addEventListener('click', function(e) {
            console.log('go');
            window.arkaneConnect.getUserAndWalletsFlow('ETHEREUM').then((result) => {
                console.log(result);
                app.log(result, 'Result of getUserAndWalletsFlow');
            }).catch((e) => {
                console.log(e);
            });
        });
    };
})();
