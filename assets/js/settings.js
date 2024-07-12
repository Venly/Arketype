(function(window) {
    'use strict';

    window.app = window.app || {};

    if (window.location.href.indexOf("demo-staging") > -1) {
        app.env = 'staging';
    } else if (window.location.href.indexOf("demo-sandbox") > -1) {
        app.env = 'sandbox';
    } else if (window.location.href.indexOf("demo-qa") > -1) {
        app.env = 'qa';
    } else if (window.location.href.indexOf("demo-qa2") > -1) {
        app.env = 'qa2';
    } else if (window.location.href.indexOf("demo") > -1) {
        app.env = 'prod';
    } else {
        app.env = 'qa';
    }

    const useLocalApi = false;
    app.clientId = new URLSearchParams(window.location.search).get('clientId') ?? 'Arketype';
    app.useLocalConnect = false;
    app.useLocalKeycloak = false;

    let resolvedEnv = resolveEnv(app.env);

    app.environment = {
        env: app.env,
        connect: app.env + (app.useLocalConnect ? '-local' : '') + (app.useLocalKeycloak ? '-local' : ''),
        api: useLocalApi ? 'http://localhost:8581/api' : 'https://api-wallet' + resolvedEnv + '.venly.io/api',
        arketypeClientSecret: '02053a9d-8293-43c4-a201-f8669f1329af', // Only visible for demo purpose, this secret should be configured in application backend
    };

    function resolveEnv(appEnv) {
        switch (appEnv) {
            case 'local':
                return '-qa';
            case 'prod':
                return appEnv;
                break;
            default:
                return '-' + appEnv;
        }
    }
})(window);
