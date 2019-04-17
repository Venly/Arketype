(function() {
    'use strict';

    window.app = window.app || {};

    app.env = 'tst1';
    app.environment = {
        env: app.env,
        // connect: app.env,
        connect: app.env + '-local',
        api: 'https://api-' + app.env + '.arkane.network',
        login: 'https://login-' + app.env + '.arkane.network',
        arketypeClientSecret: 'fd8eaade-c0c3-43b8-928f-94ef6a793e0c',
    };

    app.initApp = function() {
        window.arkaneConnect = new ArkaneConnect('Arketype', {environment: app.environment.connect, signUsing: 'REDIRECT'});
        window.arkaneConnect
              .checkAuthenticated()
              .then((result) => {
                        $('input[name=redirect]').val(window.location.href);
                        return result.authenticated(app.handleAuthenticated)
                                     .notAuthenticated((auth) => {
                                         document.body.classList.add('not-logged-in');
                                     });
                    }
              )
              .catch(reason => app.error(reason));
        app.attachLinkEvents();
    };

    app.attachLinkEvents = function() {
        document.getElementById('auth-loginlink').addEventListener('click', function(e) {
            e.preventDefault();
            window.arkaneConnect.authenticate();
        });

        document.getElementById('auth-logout').addEventListener('click', function(e) {
            e.preventDefault();
            window.arkaneConnect.logout();
        });
    };

    app.handleAuthenticated = (auth) => {
        app.auth = auth;
        app.handleSignerTypeSwitch();
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $('#auth-username').text(app.auth.subject);
        app.updateToken(app.auth.token);
        window.arkaneConnect.addOnTokenRefreshCallback(app.updateToken);
        app.checkResultRequestParams();
        app.addConnectEvents();
    };
    app.updateToken = (token) => {
        $('input[name="bearer"]').val(app.auth.token);
        $('#auth-token').val(token);
    };

})();