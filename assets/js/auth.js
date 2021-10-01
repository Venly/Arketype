(function() {
    'use strict';

    window.app = window.app || {};

    app.initApp = function() {
        window.venlyConnect = new VenlyConnect(app.clientId, {environment: app.environment.connect, windowMode: 'REDIRECT'});
        app.handleWindowModeTypeSwitch();
        window.venlyConnect
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
        var logoutButton = document.getElementById('auth-logout');
        $(".auth-loginlink").on('click', function (e) {
            e.preventDefault();
            let idpHint = $(this).data('idp-hint');
            var windowMode = app.getWindowMode();
            window.venlyConnect.flows.authenticate({windowMode: windowMode, idpHint: idpHint}).then((result) => {
                return result.authenticated(app.handleAuthenticated)
                    .notAuthenticated((auth) => {
                        document.body.classList.add('not-logged-in');
                    });
            });
        });

        if (logoutButton) {
            logoutButton.addEventListener('click', function (e) {
                e.preventDefault();
                window.venlyConnect
                    .logout()
                    .then(() => {
                        app.handleLogout();
                    });
            });
        }
    };

    app.handleAuthenticated = (auth) => {
        app.auth = auth;
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $('#client-id').text(app.clientId);
        $('#auth-username').html('<strong>' + app.auth.idTokenParsed.name + '</strong><br/>' + app.auth.subject);
        app.updateToken(app.auth.token);
        window.venlyConnect.addOnTokenRefreshCallback(app.updateToken);
        app.checkResultRequestParams();
        $(app).trigger('authenticated');
    };

    app.handleLogout = () => {
        document.body.classList.remove('logged-in');
        document.body.classList.add('not-logged-in');
        $('#client-id').text('');
        $('#auth-username').html('<strong></strong>');
        app.updateToken('');
        window.venlyConnect.addOnTokenRefreshCallback((token) => {
        });
        $(app).trigger('logout');
    };

    app.updateToken = (token) => {
        $('input[name="bearer"]').val(app.auth.token);
        $('#auth-token').val(token);
    };

})();
