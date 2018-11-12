var app = app || {};

app.initApp = function () {
    window.arkaneConnect = new ArkaneConnect('Arketype', ['VeChain'], 'staging');
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

app.addConnectEvents = function() {
    document.getElementById('arkane-sign-eth').addEventListener('click', function() {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        window.arkaneConnect.initPopup();
        //custom logic
        window.arkaneConnect.signTransaction({
            type: 'ETHEREUM_TRANSACTION',
            walletId: $("#sign-select-ETHEREUM").val(),
            submit: false,
            nonce: 0,
            value: 1000000000000000000,
            data: '0x',
            to: '0x9d10dC3c5eFA3c0Ec3cA06B99B8451aB2ECb4401'
        }).then(function(result) {
            app.log(result);
        }).catch(function(error) {
            app.log(error);
        });
    });

    document.getElementById('arkane-execute-eth').addEventListener('click', function() {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        window.arkaneConnect.initPopup();
        //custom logic
        window.arkaneConnect.buildTransactionRequest({
            walletId: $("#execute-select-ETHEREUM").val(),
            secretType: 'ETHEREUM',
            to: "0xf147cA0b981C0CD0955D1323DB9980F4B43e9FED",
            value: 3.14
        }).then(transaction => {
                window.arkaneConnect
                      .executeTransaction(transaction)
                      .then(function(result) {
                          app.log(result);
                      })
                      .catch(function(error) {
                          app.log(error);
                      });
            }
        );
    });

    document.getElementById('get-wallets').addEventListener('click', function() {
        window.arkaneConnect.getWallets().then(function(e) {
            app.log(e);
            var secretTypes = ["ETHEREUM", "VECHAIN"];
            for (s of secretTypes) {

            }
            $('#sign-select-' + 'ETHEREUM').find('option').remove();
            $('#sign-select-' + 'VECHAIN').find('option').remove();
            $('#execute-select-' + 'ETHEREUM').find('option').remove();
            $('#execute-select-' + 'VECHAIN').find('option').remove();
            for (w of e) {
                $('#sign-select-' + w.secretType).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));
                $('#execute-select-' + w.secretType).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));
            }
            $('#sign').show();
            $('#execute').show();
        });
    });

    document.getElementById('manage-wallets').addEventListener('click', function() {
        window.arkaneConnect.manageWallets();
    });

    document.getElementById('get-profile').addEventListener('click', function() {
        window.arkaneConnect.getProfile().then(function(e) {
            app.log(e);
        });
    });

    document.getElementById('arkane-sign-vechain').addEventListener('click', function() {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        window.arkaneConnect.initPopup();
        //custom logic
        window.arkaneConnect.signTransaction({
            type: 'VECHAIN_TRANSACTION',
            walletId: $("#sign-select-VECHAIN").val(),
            submit: false,
            clauses: [{
                to: '0xF29C73DA25795469ABa28277f831E85D49806b3F',
                amount: "1000000000000000000000",
            }]
        }).then(function(result) {
            app.log(result);
        }).catch(function(error) {
            app.log(error);
        });
    });

    document.getElementById('arkane-execute-vechain').addEventListener('click', function() {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        window.arkaneConnect.initPopup();
        //custom logic
        window.arkaneConnect.buildTransactionRequest({
            walletId: $("#execute-select-VECHAIN").val(),
            secretType: 'VECHAIN',
            to: "0x47F40Baf2dc0ccf065c44F44c0B0F49a0c690cd0",
            value: 700.13
        }).then(transaction => {
                window.arkaneConnect
                      .executeTransaction(transaction)
                      .then(function(result) {
                          app.log(result);
                      })
                      .catch(function(error) {
                          app.log(error);
                      });
                // tokenAddress: "0x9c6e62b3334294d70c8e410941f52d482557955b"
            }
        );
    });

    document.getElementById('close-popup').addEventListener('click', function() {
        window.arkaneConnect.closePopup();
    });
};

app.getWallets = function() {
    window.arkaneConnect.getWallets().then(function(result) {
        app.log(result);
    })
};

app.log = function(txt) {
    if (isObject(txt)) {
        txt = JSON.stringify(txt);
    }
    var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    txt = '---' + date + '---\n' + txt;
    $('#appLog').val(function(index, old) {
        return txt + "\n\n" + old;
    });
};

function isObject(obj) {
    return obj === Object(obj);
}

app.initApp();
