var app = app || {};
app.auth = {};

app.initApp = function() {
    window.arkaneConnect = new ArkaneConnect('Arketype', {environment: 'staging', signUsing: 'REDIRECT'});
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
          .catch(reason => app.log(reason));
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
    document.body.classList.add('logged-in');
    $('#auth-username').text(app.auth.subject);
    app.updateToken(app.auth.token);
    window.arkaneConnect.addOnTokenRefreshCallback(app.updateToken);
    app.checkResultRequestParams();
    app.addConnectEvents();
    app.getWallets();
};
app.updateToken = (token) => {
    $('input[name="bearer"]').val(app.auth.token);
    $('#auth-token').val(token);
};

app.checkResultRequestParams = function() {
    const status = this.getQueryParam('status');
    if (status === 'SUCCESS') {
        app.log({status: status, result: app.extractResultFromQueryParams()});
    } else
        if (status === 'ABORTED') {
            app.log({status, errors: []});
        }
};

app.extractResultFromQueryParams = function() {
    const validResultParams = ['transactionHash', 'signedTransaction', 'r', 's', 'v'];
    const result = {};
    const regex = new RegExp(/[\?|\&]([^=]+)\=([^&]+)/g);
    let requestParam = regex.exec(window.location.href);
    while (requestParam && requestParam !== null) {
        if (validResultParams.includes(requestParam[1])) {
            var asObject = {};
            asObject[decodeURIComponent(requestParam[1])] = decodeURIComponent(requestParam[2]);
            Object.assign(result, asObject);
        }
        requestParam = regex.exec(window.location.href);
    }
    return result;
};

app.addConnectEvents = function() {
    document.getElementById('get-wallets').addEventListener('click', function() {
        window.arkaneConnect.api.getWallets().then(function(e) {
            app.log(e);
            $('#sign-ETHEREUM-form select[name=\'walletId\']').find('option').remove();
            $('#sign-ETHEREUM-RAW-form select[name=\'walletId\']').find('option').remove();
            $('#sign-VECHAIN-form select[name=\'walletId\']').find('option').remove();
            $('#execute-ETHEREUM-form select[name=\'walletId\']').find('option').remove();
            $('#execute-VECHAIN-form select[name=\'walletId\']').find('option').remove();
            $('#execute-BITCOIN-form select[name=\'walletId\']').find('option').remove();

            for (w of e) {
                $(`#sign-${w.secretType}-form select[name='walletId']`).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));

                $(`#sign-${w.secretType}-RAW-form select[name='walletId']`).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));

                $(`#execute-${w.secretType}-form select[name='walletId']`).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));
            }
            $('#sign').show();
            $('#execute').show();
        });
    });

    document.querySelectorAll('.manage-wallets').forEach(function(el) {
        el.addEventListener('click', function() {
            window.arkaneConnect.manageWallets(this.dataset.chain, {redirectUri: 'http://localhost:4000', correlationID: `${Date.now()}`});
        });
    });

    document.getElementById('link-wallets').addEventListener('click', function() {
        window.arkaneConnect.linkWallets({redirectUri: 'http://localhost:4000'});
    });

    document.getElementById('get-profile').addEventListener('click', function() {
        window.arkaneConnect.api.getProfile().then(function(e) {
            app.log(e);
        });
    });

    document.getElementById('sign-ETHEREUM-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const data = $('#sign-ETHEREUM-form textarea[name=\'data\']').val();
        window.arkaneConnect
              .createSigner()
              .signTransaction(
                  {
                      type: 'ETHEREUM_TRANSACTION',
                      walletId: $('#sign-ETHEREUM-form select[name=\'walletId\']').val(),
                      submit: false,
                      to: $('#sign-ETHEREUM-form input[name=\'to\']').val(),
                      value: $('#sign-ETHEREUM-form input[name=\'value\']').val(),
                      data: data ? data : null,
                  },
                  {
                      redirectUri: 'http://localhost:4000',
                      correlationID: `${Date.now()}`
                  }
              )
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });
    });

    document.getElementById('sign-ETHEREUM-RAW-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Sign Ethereum RAW
        const data = $('#sign-ETHEREUM-RAW-form textarea[name=\'data\']').val();
        window.arkaneConnect
              .createSigner()
              .signTransaction(
                  {
                      type: 'ETHEREUM_RAW',
                      walletId: $('#sign-ETHEREUM-RAW-form select[name=\'walletId\']').val(),
                      data: data ? data : null,
                  },
                  {
                      redirectUri: 'http://localhost:4000',
                      correlationID: `${Date.now()}`
                  }
              )
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });
    });

    document.getElementById('sign-VECHAIN-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const data = $('#sign-VECHAIN-form textarea[name=\'data\']').val();
        window.arkaneConnect
              .createSigner()
              .signTransaction(
                  {
                      type: 'VECHAIN_TRANSACTION',
                      walletId: $('#sign-VECHAIN-form select[name=\'walletId\']').val(),
                      submit: false,
                      clauses: [{
                          to: $('#sign-VECHAIN-form input[name=\'to\']').val(),
                          amount: $('#sign-VECHAIN-form input[name=\'value\']').val(),
                          data: data ? data : null,
                      }]
                  },
                  {
                      redirectUri: 'http://localhost:4000',
                      correlationID: `${Date.now()}`
                  }
              )
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });
    });

    document.getElementById('execute-ETHEREUM-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Generic transaction
        const data = $('#execute-ETHEREUM-form textarea[name=\'data\']').val();
        window.arkaneConnect
              .createSigner()
              .executeTransaction(
                  {
                      walletId: $('#execute-ETHEREUM-form select[name=\'walletId\']').val(),
                      to: $('#execute-ETHEREUM-form input[name=\'to\']').val(),
                      value: ($('#execute-ETHEREUM-form input[name=\'value\']').val() / Math.pow(10, 18)),
                      secretType: 'ETHEREUM',
                      tokenAddress: $('#execute-ETHEREUM-form input[name=\'tokenAddress\']').val(),
                      data: data === '' ? null : data,
                  },
                  {redirectUri: 'http://localhost:4000', correlationID: `${Date.now()}`}
              )
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });

        // Native ETH transaction
        // window.arkaneConnect
        //       .createSigner()
        //       .executeNativeTransaction(
        //           {
        //               type: 'ETH_TRANSACTION',
        //               walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //               to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //               value: $("#execute-ETHEREUM-form input[name='value']").val(),
        //               data: data === "" ? null : data,
        //           },
        //           {
        //               redirectUri: 'http://localhost:4000',
        //               correlationID: `${Date.now()}`
        //           }
        //       )
        //       .then(function(result) {
        //           app.log(result);
        //       })
        //       .catch(function(err) {
        //           app.log(err);
        //       });

        // Native ERC20 transaction
        // window.arkaneConnect
        //       .createSigner()
        //       .executeNativeTransaction(
        //           {
        //               type: 'ETHEREUM_ERC20_TRANSACTION',
        //               walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //               to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //               value: $("#execute-ETHEREUM-form input[name='value']").val(),
        //               tokenAddress: '0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2',
        //           },
        //           {
        //               redirectUri: 'http://localhost:4000',
        //               correlationID: `${Date.now()}`
        //           }
        //       )
        //       .then(function(result) {
        //           app.log(result);
        //       })
        //       .catch(function(err) {
        //           app.log(err);
        //       });
    });

    document.getElementById('execute-VECHAIN-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Generic transaction
        const data = $('#execute-VECHAIN-form textarea[name=\'data\']').val();
        window.arkaneConnect
              .createSigner()
              .executeTransaction(
                  {
                      walletId: $('#execute-VECHAIN-form select[name=\'walletId\']').val(),
                      to: $('#execute-VECHAIN-form input[name=\'to\']').val(),
                      value: ($('#execute-VECHAIN-form input[name=\'value\']').val() / Math.pow(10, 18)),
                      secretType: 'VECHAIN',
                      tokenAddress: $('#execute-VECHAIN-form input[name=\'tokenAddress\']').val(),
                      data: data ? data : null,
                  },
                  {redirectUri: 'http://localhost:4000', correlationID: `${Date.now()}`}
              )
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });

        // Native VET transaction
        // window.arkaneConnect.createSigner().executeNativeTransaction(
        //     {
        //         type: 'VET_TRANSACTION',
        //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //         clauses: [{
        //             to: $("#execute-VECHAIN-form input[name='to']").val(),
        //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
        //             data: data ? data : null,
        //         }]
        //     },
        //     {
        //         redirectUri: 'http://localhost:4000',
        //         correlationID: `${Date.now()}`
        //     }
        // );

        // Native VIP180 transaction
        // window.arkaneConnect.createSigner().executeNativeTransaction(
        //     {
        //         type: 'VECHAIN_VIP180_TRANSACTION',
        //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //         clauses: [{
        //             to: $("#execute-VECHAIN-form input[name='to']").val(),
        //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
        //             tokenAddress: '0x9c6e62b3334294d70c8e410941f52d482557955b',
        //         }]
        //     },
        //     {
        //         redirectUri: 'http://localhost:4000',
        //         correlationID: `${Date.now()}`
        //     }
        // );
    });

    document.getElementById('execute-BITCOIN-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Generic transaction
        window.arkaneConnect
              .createSigner()
              .executeTransaction(
                  {
                      secretType: 'BITCOIN',
                      walletId: $('#execute-BITCOIN-form select[name=\'walletId\']').val(),
                      to: $('#execute-BITCOIN-form input[name=\'to\']').val(),
                      value: $('#execute-BITCOIN-form input[name=\'value\']').val() / Math.pow(10, 8),
                  },
                  {redirectUri: 'http://localhost:4000', correlationID: `${Date.now()}`}
              )
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });

        // Native BITCOIN transaction
        // window.arkaneConnect.createSigner().executeNativeTransaction(
        //     {
        //         type: 'BTC_TRANSACTION',
        //         walletId: $("#execute-BITCOIN-form select[name='walletId']").val(),
        //         to: $("#execute-BITCOIN-form input[name='to']").val(),
        //         value: $("#execute-BITCOIN-form input[name='value']").val(),
        //     },
        //     {
        //         redirectUri: 'http://localhost:4000',
        //         correlationID: `${Date.now()}`
        //     }
        // );
    });
};

app.getWallets = function() {
    window.arkaneConnect.getWallets().then(function(result) {
        app.log(result);
    })
};

app.log = function(txt) {
    if (isObject(txt)) {
        txt = JSON.stringify(txt, null, 2);
    }
    var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    txt = '---' + date + '---\n' + txt;
    $('#appLog').html(txt + '\n\n' + $('#appLog').html());
};

app.getQueryParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURIComponent(results[1]) || 0;
};

function isObject(obj) {
    return obj === Object(obj);
}

app.initApp();
