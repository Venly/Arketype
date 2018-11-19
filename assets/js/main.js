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

    document.getElementById('link-wallets').addEventListener('click', function() {
        window.arkaneConnect.linkWallets();
    });

    document.getElementById('get-profile').addEventListener('click', function() {
        window.arkaneConnect.getProfile().then(function(e) {
            app.log(e);
        });
    });

    document.getElementById('arkane-sign-vechain').addEventListener('click', function() {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        const signer = window.arkaneConnect.createSigner();

        // Start - Custom logic (e.g. build the transaction request)
        let transactionRequest;
        try {
            transactionRequest = {
                type: 'VECHAIN_TRANSACTION',
                walletId: $("#sign-select-VECHAIN").val(),
                submit: false,
                clauses: [{
                    to: '0xF29C73DA25795469ABa28277f831E85D49806b3F',
                    amount: '1000000000000000000000',
                }]
            };
        }
        catch (error) {
            // Always catch errors, otherwise the initialising popup appears to be hanging if something goes wrong
            signer.close();
            app.log(error);
        }
        // End - Custom logic

        signer.signTransaction(transactionRequest)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(error) {
                  app.log(error);
              });
    });

    document.getElementById('arkane-sign-eth').addEventListener('click', function() {
        //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        const signer = window.arkaneConnect.createSigner();

        // Start - Custom logic (e.g. build the transaction request)
        let transactionRequest;
        try {
            transactionRequest = {
                type: "ETHEREUM_TRANSACTION",
                walletId: $("#sign-select-ETHEREUM").val(),
                to: "0xf147cA0b981C0CD0955D1323DB9980F4B43e9FED",
                value: 3140000000000000000,
            };
        }
        catch (error) {
            // Always catch errors, otherwise the initialising popup appears to be hanging if something goes wrong
            signer.close();
            app.log(error);
        }
        // End - Custom logic

        signer.signTransaction(transactionRequest)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(error) {
                  app.log(error);
              });
    });

    document.getElementById('arkane-execute-eth').addEventListener('click', async function() {
            // If you want to do custom logic between the user pressing a button and sgning a transaction, please initialize the popup first as shown below
            // otherwise the browser might block the popup
            const signer = window.arkaneConnect.createSigner();

            // Start - Custom logic (e.g. build the transaction request)
            window.arkaneConnect
                  .buildTransactionRequest({
                      walletId: $("#execute-select-ETHEREUM").val(),
                      secretType: 'ETHEREUM',
                      to: "0x680800Dd4913021821A9C08D569eF4338dB8E9f6",
                      value: 0.0314
                  })
                  .then((transactionRequest) => {
                      signer.executeTransaction(transactionRequest)
                            .then(function(result) {
                                app.log(result);
                            })
                            .catch(function(error) {
                                app.log(error);
                            });
                  })
                  .catch((error) => {
                      // Always catch errors and close the signer, otherwise it looks like the initialising popup is hanging when something goes wrong
                      signer.close();
                      app.log(error);
                  });
        }
    );

    document.getElementById('arkane-execute-vechain').addEventListener('click', function() {
        // If you want to do custom logic between the user pressing a button and sgning a transaction, please initialize the popup first as shown below
        // otherwise the browser might block the popup
        let signer = window.arkaneConnect.createSigner();

        // Start - Custom logic (e.g. build the transaction request)
        window.arkaneConnect
              .buildTransactionRequest({
                  walletId: $("#execute-select-VECHAIN").val(),
                  secretType: 'VECHAIN',
                  to: "0x47F40Baf2dc0ccf065c44F44c0B0F49a0c690cd0",
                  value: 700.13
              })
              .then((transactionRequest) => {
                  signer.executeTransaction(transactionRequest)
                        .then(function(result) {
                            app.log(result);
                        })
                        .catch(function(error) {
                            app.log(error);
                        });
              })
              .catch((error) => {
                  // Always catch errors and close the signer, otherwise it looks like the initialising popup is hanging when something goes wrong
                  signer.close();
                  app.log(error);
              });
    });

    document.getElementById('close-signer').addEventListener('click', function() {
        window.arkaneConnect.destroySigner();
    });
}
;

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
