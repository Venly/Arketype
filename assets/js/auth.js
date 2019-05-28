(function() {
    'use strict';

    window.app = window.app || {};

    app.initApp = function() {
        window.arkaneConnect = new ArkaneConnect(app.clientId, {environment: app.environment.connect, windowMode: 'REDIRECT'});
        app.handleWindowModeTypeSwitch();
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
            var windowMode = app.getWindowMode();
            window.arkaneConnect.authenticate({windowMode: windowMode}).then((result) => {
                return result.authenticated(app.handleAuthenticated)
                             .notAuthenticated((auth) => {
                                 document.body.classList.add('not-logged-in');
                             });
            });
        });

        document.getElementById('auth-logout').addEventListener('click', function(e) {
            e.preventDefault();
            window.arkaneConnect
                  .logout()
                  .then(() => {
                      app.handleNotAuthenticated();
                  });
        });
    };

    app.handleAuthenticated = (auth) => {
        app.auth = auth;
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $('#client-id').text(app.clientId);
        $('#auth-username').html('<strong>' + app.auth.idTokenParsed.name + '</strong><br/>' + app.auth.subject);
        app.updateToken(app.auth.token);
        window.arkaneConnect.addOnTokenRefreshCallback(app.updateToken);
        app.checkResultRequestParams();
        $(app).trigger('authenticated');
    };

    app.handleNotAuthenticated = () => {
        document.body.classList.remove('logged-in');
        document.body.classList.add('not-logged-in');
        $('#client-id').text('');
        $('#auth-username').html('<strong></strong>');
        app.updateToken('');
        window.arkaneConnect.addOnTokenRefreshCallback((token) => {});
    };

    app.updateToken = (token) => {
        $('input[name="bearer"]').val(app.auth.token);
        $('#auth-token').val(token);
    };

})();
