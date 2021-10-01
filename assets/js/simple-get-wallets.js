(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};

    app.initApp = function() {
        window.venlyConnect = new VenlyConnect(app.clientId, {environment: app.environment.connect});

        document.getElementById('connect-with-venly').addEventListener('click', function(e) {
            window.venlyConnect.flows.getAccount('ETHEREUM').then((result) => {
                app.log(result, 'Result of venlyConnect.flows.getAccount');
            });
        });
    };
})();
