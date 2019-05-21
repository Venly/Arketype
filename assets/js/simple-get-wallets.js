(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};

    app.initApp = function() {
        window.arkaneConnect = new ArkaneConnect(app.clientId, {environment: app.environment.connect});

        document.getElementById('connect-with-arkane').addEventListener('click', function(e) {
            window.arkaneConnect.flows.getAccount('ETHEREUM').then((result) => {
                app.log(result, 'Result of arkaneConnect.flows.getAccount');
            });
        });
    };
})();
