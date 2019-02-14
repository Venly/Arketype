(function() {
    'use strict';

    window.app = window.app || {};
    app.auth = {};
    var redirectUri = 'http://localhost:4000';

    app.initApp = function() {
        window.arkaneConnect = new ArkaneConnect('Arketype', {environment: 'qa', signUsing: 'REDIRECT'});
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
        var status = this.getQueryParam('status');
        if (status === 'SUCCESS') {
            app.log({status: status, result: app.extractResultFromQueryParams()});
        } else
            if (status === 'ABORTED') {
                app.log({status, errors: []});
            }
    };

    app.extractResultFromQueryParams = function() {
        const validResultParams = ['transactionHash', 'signedTransaction', 'r', 's', 'v', 'signature'];
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

    function signTransaction(signData) {
        window.arkaneConnect.createSigner().signTransaction(signData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });
    }

    function executeTransaction(executeData) {
        window.arkaneConnect.createSigner().executeTransaction(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.log(err);
              });
    }

    // function executeNativeTransaction(executeData) {
    //     window.arkaneConnect.createSigner().executeNativeTransaction(executeData)
    //           .then(function(result) {
    //               app.log(result);
    //           })
    //           .catch(function(err) {
    //               app.log(err);
    //           });
    // }

    app.addConnectEvents = function() {
        document.getElementById('get-wallets').addEventListener('click', function() {
            window.arkaneConnect.api.getWallets().then(function(wallets) {
                app.log(wallets);
                $('[data-form]').each(function() {
                    $('select[name="walletId"]', this).find('option').remove();
                });

                for (var w of wallets) {
                    $('[data-form][data-chain="' + w.secretType.toUpperCase() + '"]').each(function() {
                        $('select[name="walletId"]', this).append($('<option>', {
                            value: w.id,
                            text: w.address
                        }));
                    });
                }
                $('#sign, #execute').show();
            });
        });

        document.querySelectorAll('.manage-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                window.arkaneConnect.manageWallets(this.dataset.chain, {redirectUri, correlationID: `${Date.now()}`});
            });
        });

        document.getElementById('link-wallets').addEventListener('click', function() {
            window.arkaneConnect.linkWallets({redirectUri});
        });

        document.getElementById('get-profile').addEventListener('click', function() {
            window.arkaneConnect.api.getProfile().then(function(e) {
                app.log(e);
            });
        });

        var formSignEth = document.querySelector('[data-form="sign"][data-chain="ETHEREUM"]');
        formSignEth.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignEth).val() || null;
            var walletId = $('select[name="walletId"]', formSignEth).val();
            var to = $('input[name="to"]', formSignEth).val();
            var value = $('input[name="value"]', formSignEth).val();
            signTransaction({
                type: 'ETHEREUM_TRANSACTION',
                walletId,
                submit: false,
                to,
                value,
                data
            });
        });

        var formSignEthRaw = document.querySelector('[data-form="sign-raw"][data-chain="ETHEREUM"]');
        formSignEthRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignEthRaw).val() || null;
            var walletId = $('select[name="walletId"]', formSignEthRaw).val();
            signTransaction({
                type: 'ETHEREUM_RAW',
                walletId,
                data
            });
        });

        var formSignVechain = document.querySelector('[data-form="sign"][data-chain="VECHAIN"]');
        formSignVechain.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignVechain).val() || null;
            var walletId = $('select[name="walletId"]', formSignVechain).val();
            var to = $('input[name="to"]', formSignVechain).val();
            var value = $('input[name="value"]', formSignVechain).val();
            signTransaction({
                type: 'VECHAIN_TRANSACTION',
                walletId,
                submit: false,
                clauses: [{
                    to,
                    amount: value,
                    data: data,
                }]
            });
        });

        var formExecEth = document.querySelector('[data-form="execute"][data-chain="ETHEREUM"]');
        formExecEth.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExecEth).val() || null;
            var walletId = $('select[name="walletId"]', formExecEth).val();
            var to = $('input[name="to"]', formExecEth).val();
            var value = $('input[name="value"]', formExecEth).val() / Math.pow(10, 18);
            var tokenAddress = $('input[name="tokenAddress"]', formExecEth).val();

            // Generic transaction
            executeTransaction({
                secretType: 'ETHEREUM',
                walletId,
                to,
                value,
                tokenAddress,
                data
            });

            // Native ETH transaction
            // executeTransaction (
            //           {
            //               type: 'ETH_TRANSACTION',
            //               walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
            //               to: $("#execute-ETHEREUM-form input[name='to']").val(),
            //               value: $("#execute-ETHEREUM-form input[name='value']").val(),
            //               data: data === "" ? null : data,
            //           },
            //       )

            // Native ERC20 transaction
            // executeNativeTransaction (
            //           {
            //               type: 'ETHEREUM_ERC20_TRANSACTION',
            //               walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
            //               to: $("#execute-ETHEREUM-form input[name='to']").val(),
            //               value: $("#execute-ETHEREUM-form input[name='value']").val(),
            //               tokenAddress: '0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2',
            //           },
            //       );
        });

        var formExecVechain = document.querySelector('[data-form="execute"][data-chain="VECHAIN"]');
        formExecVechain.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExecVechain).val() || null;
            var walletId = $('select[name="walletId"]', formExecVechain).val();
            var to = $('input[name="to"]', formExecVechain).val();
            var value = $('input[name="value"]', formExecVechain).val()  / Math.pow(10, 18);
            var tokenAddress = $('input[name="tokenAddress"]', formExecVechain).val();

            // Generic transaction
            executeTransaction({
                secretType: 'VECHAIN',
                walletId,
                to,
                value,
                tokenAddress,
                data
            });

            // Native VET transaction
            // executeNativeTransaction(
            //     {
            //         type: 'VET_TRANSACTION',
            //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
            //         clauses: [{
            //             to: $("#execute-VECHAIN-form input[name='to']").val(),
            //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
            //             data: data ? data : null,
            //         }]
            //     }
            // );

            // Native VIP180 transaction
            // executeNativeTransaction(
            //     {
            //         type: 'VECHAIN_VIP180_TRANSACTION',
            //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
            //         clauses: [{
            //             to: $("#execute-VECHAIN-form input[name='to']").val(),
            //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
            //             tokenAddress: '0x9c6e62b3334294d70c8e410941f52d482557955b',
            //         }]
            //     }
            // );
        });

        var formExecBitcoin = document.querySelector('[data-form="execute"][data-chain="BITCOIN"]');
        formExecBitcoin.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formExecBitcoin).val();
            var to = $('input[name="to"]', formExecBitcoin).val();
            var value = $('input[name="value"]', formExecBitcoin).val() / Math.pow(10, 8);

            // Generic transaction
            executeTransaction({
                secretType: 'BITCOIN',
                walletId,
                to,
                value,
            });


            // Native BITCOIN transaction
            // executeNativeTransaction({
            //     type: 'BTC_TRANSACTION',
            //     walletId: $('#execute-BITCOIN-form select[name=\'walletId\']').val(),
            //     to: $('#execute-BITCOIN-form input[name=\'to\']').val(),
            //     value: $('#execute-BITCOIN-form input[name=\'value\']').val(),
            // });
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

    app.clearLog = function() {
        $('#appLog').html('');
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

    $(function() {
        app.initApp();
    });

})();
