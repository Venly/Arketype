var app = app || {};

app.initApp = function () {
    window.arkaneConnect = new ArkaneConnect('ThorBlock', ['VeChain'], 'staging');
    window.arkaneConnect
          .checkAuthenticated()
          .then((result) => result.authenticated(app.handleAuthenticated)
                                  .notAuthenticated((auth) => {
                                      document.body.classList.add('not-logged-in');
                                  })
          )
          .catch(reason => app.log(reason));
    this.attachLinkEvents();
};

app.attachLinkEvents = function () {
    document.getElementById('auth-loginlink').addEventListener('click', function (e) {
        e.preventDefault();
        window.arkaneConnect.authenticate();
    });

    document.getElementById('auth-logout').addEventListener('click', function (e) {
        e.preventDefault();
        window.arkaneConnect.logout();
    });
};

app.handleAuthenticated = (auth) => {
    document.body.classList.add('logged-in');
    $('#auth-username').text(auth.subject);
    app.updateToken(auth.token);
    window.arkaneConnect.addOnTokenRefreshCallback(app.updateToken);
    app.addConnectEvents();
    app.getWallets();
};

app.updateToken = (token) => {
    $('#auth-token').val(token);
};

app.addConnectEvents = function () {
    document.getElementById('arkane-sign-eth').addEventListener('click', function () {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        window.arkaneConnect.initPopup();
        //custom logic
        window.arkaneConnect.signTransaction({
                                                 type: 'ETHEREUM_TRANSACTION',
                                                 walletId: $("#sign-select-ETHEREUM").val(),
                                                 submit: false,
                                                 gasPrice: 10000000000,
                                                 gas: 23000,
                                                 nonce: 0,
                                                 value: 10000000000,
                                                 data: '0x',
                                                 to: '0xdc71b72db51e227e65a45004ab2798d31e8934c9'
                                             }).then(function (result) {
            app.log(result);
        }).catch(function (error) {
            app.log(error);
        });
    });

    document.getElementById('get-wallets').addEventListener('click', function () {
        window.arkaneConnect.getWallets().then(function (e) {
            app.log(e);
            var secretTypes = ["ETHEREUM", "VECHAIN"];
            for (s of secretTypes) {

            }
            $('#sign-select-' + 'ETHEREUM').find('option').remove();
            $('#sign-select-' + 'VECHAIN').find('option').remove();
            for (w of e) {
                $('#sign-select-' + w.secretType).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));
            }
            $('#sign').show();
        });
    });

    document.getElementById('get-profile').addEventListener('click', function () {
        window.arkaneConnect.getProfile().then(function (e) {
            app.log(e);
        });
    });

    document.getElementById('arkane-sign-vechain').addEventListener('click', function () {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        window.arkaneConnect.initPopup();
        //custom logic
        window.arkaneConnect.signTransaction({
                                                 type: 'VECHAIN_TRANSACTION',
                                                 walletId: $("#sign-select-VECHAIN").val(),
                                                 submit: false,
                                                 gas: 23000,
                                                 gasPriceCoef: 0,
                                                 clauses: [{
                                                     to: '0xdc71b72db51e227e65a45004ab2798d31e8934c9',
                                                     amount: "10000000000000000000",
                                                     data: '0x0'
                                                 }]
                                             }).then(function (result) {
            app.log(result);
        }).catch(function (error) {
            app.log(error);
        });
    });

    document.getElementById('close-popup').addEventListener('click', function () {
        window.arkaneConnect.closePopup();
    });
};

app.getWallets = function () {
    window.arkaneConnect.getWallets().then(function (result) {
        app.log(result);
    })
};

app.log = function (txt) {
    if (isObject(txt)) {
        txt = JSON.stringify(txt);
    }
    var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    txt = '---' + date + '---\n' + txt;
    $('#appLog').val(function (index, old) {
        return txt + "\n\n" + old;
    });
};

function isObject(obj) {
    return obj === Object(obj);
}

app.initApp();
