(function() {
    'use strict';

    window.app = window.app || {};

    app.env = 'tst1';
    app.clientId = 'Arketype';
    app.isLocal = false;
    app.environment = {
        env: app.env,
        connect: app.env + (app.isLocal ? '-local' : ''),
        api: 'https://api-' + app.env + '.arkane.network',
        login: 'https://login-' + app.env + '.arkane.network',
        arketypeClientSecret: '02053a9d-8293-43c4-a201-f8669f1329af', // Only visible for demo purpose, this secret should be configured in application backend
    };


})();
