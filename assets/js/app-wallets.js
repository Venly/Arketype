(function() {
    'use strict';

    window.app = window.app || {};
    app.auth = {};

    var redirectUri = window.location.href.replace(window.location.search, '');

    app.checkResultRequestParams = function() {
        var status = this.getQueryParam('status');
        if (status === 'SUCCESS') {
            app.log({status: status, result: app.extractResultFromQueryParams()});
        } else if (status === 'ABORTED') {
            app.error({status, errors: []});
        } else if (status === 'FAILED') {
            const errorObject = this.extractResultFromQueryParams();
            app.error({status: status, errors: [errorObject.error]});
        }
    };

    app.extractResultFromQueryParams = function() {
        const validResultParams = ['transactionHash', 'signedTransaction', 'r', 's', 'v', 'signature', 'error', 'walletId'];
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

    function executeTransaction(executeData) {
        window.arkaneConnect.createSigner().executeTransaction(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeNativeTransaction(executeData) {
        window.arkaneConnect.createSigner().executeNativeTransaction(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function getWallets(el) {
        var secretType = el.dataset.chain.toUpperCase();
        window.arkaneConnect.api.getWallets({secretType: secretType, walletType: 'APPLICATION'}).then(function(wallets) {
            el.dataset.success = 'true';
            app.log(wallets, 'Application wallets ' + secretType);
            const dataSetName = 'wallets' + secretType.charAt(0).toUpperCase() + secretType.slice(1).toLowerCase();
            document.querySelector('body').dataset[dataSetName] = JSON.stringify(wallets);
            var $forms = $('[data-form][data-chain="' + secretType.toUpperCase() + '"]');
            $forms.each(function() {
                $('select[name="walletId"]', this).find('option').remove();
                $('select[name="walletId"]', this).append($('<option>', {
                    value: '',
                    text: '-- No Wallet Selected --',
                    'data-address': '',
                }));
            });

            for (var w of wallets) {
                $forms.each(function() {
                    $('select[name="walletId"]', this).append($('<option>', {
                        value: w.id,
                        text: w.description ? w.description + ' - ' + w.address : w.address,
                        'data-address': w.address,
                    }));
                });
            }

            $('select[name="walletId"]', $forms).each(function() {
                if (this.length > 1) {
                    this.selectedIndex = 1;
                }
            });
        });
    }

    app.addConnectEvents = function() {
        var secretType = (localStorage && localStorage.getItem('arketype.activeChain')) || 'ETHEREUM';
        $('[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var button = document.querySelector($(e.target).attr('href') + ' .get-wallets');
            if (button && button.dataset['success'] !== 'true') {
                if (localStorage && button.dataset.chain) {
                    localStorage.setItem('arketype.activeChain', button.dataset.chain);
                }
                getWallets(button);
            }
        });
        $('#nav-' + secretType + '-tab').trigger('click');
        document.querySelectorAll('.get-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                getWallets(el);
            });
        });

        document.querySelectorAll('.create-app-wallet').forEach(function(el) {
            el.addEventListener('click', async function() {
                const signer = window.arkaneConnect.createSigner();
                const newWallet = await signer.confirm({
                                                           secretType: this.dataset.chain,
                                                           confirmationRequestType: 'CREATE_APPLICATION_WALLET'
                                                       });
                app.log(newWallet, "New wallet created");
            });

        });

        document.getElementById('get-profile').addEventListener('click', function() {
            window.arkaneConnect.api.getProfile().then(function(e) {
                app.log(e);
            });
        });

        // function getDataFromForm(form) {
        //     var data = $('textarea[name="data"]', form).val() || null;
        //     var walletId = $('select[name="walletId"]', form).val() || null;
        //     var to = $('input[name="to"]', form).val() || null;
        //     var value = $('input[name="value"]', form).val() || null;
        //     var tokenAddress = $('input[name="tokenAddress"]', form).val() || null;
        //
        //     var result = {
        //         walletId,
        //         to,
        //         value,
        //         tokenAddress,
        //         data
        //     };
        //
        //     var $hash = $('input[name="hash"]', form);
        //     $hash.length > 0 ? result.hash = $hash.is(':checked') : null;
        //     var $prefix = $('input[name="prefix"]', form);
        //     $prefix.length > 0 ? result.prefix = $prefix.is(':checked') : null;
        //
        //     return result;
        // }

        // var formExecEth = document.querySelector('[data-form="execute"][data-chain="ETHEREUM"]');
        // formExecEth.addEventListener('submit', function(e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     var formData = getDataFromForm(formExecEth);
        //     // Generic transaction
        //     executeTransaction({
        //                            secretType: 'ETHEREUM',
        //                            walletId: formData.walletId,
        //                            to: formData.to,
        //                            value: formData.value,
        //                            tokenAddress: formData.tokenAddress,
        //                            data: formData.data
        //                        });
        //
        //     // Native ETH transaction
        //     // executeTransaction (
        //     //           {
        //     //               type: 'ETH_TRANSACTION',
        //     //               walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //     //               to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //     //               value: $("#execute-ETHEREUM-form input[name='value']").val(),
        //     //               data: data === "" ? null : data,
        //     //           },
        //     //       )
        //
        //     // Native ERC20 transaction
        //     // executeNativeTransaction (
        //     //           {
        //     //               type: 'ETHEREUM_ERC20_TRANSACTION',
        //     //               walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //     //               to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //     //               value: $("#execute-ETHEREUM-form input[name='value']").val(),
        //     //               tokenAddress: '0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2',
        //     //           },v
        //     //       );
        // });

        var formExecTrx = document.querySelector('[data-form="request"][data-chain="TRON"]');
        formExecTrx.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();

            const signer = window.arkaneConnect.createSigner();
            var data = $('textarea[name="data"]', formExecTrx).val() || null;
            var walletId = $('select[name="walletId"]', formExecTrx).val();
            var to = $('input[name="to"]', formExecTrx).val();
            var value = $('input[name="value"]', formExecTrx).val() * 100000;
            // var tokenAddress = $('input[name="tokenAddress"]', formExecTrx).val();
            // tokenAddress,
            // data

            app.requestApplicationBearerToken(
                app.requestTransaction(
                    {
                        type: 'TRX_TRANSACTION',
                        walletId,
                        to,
                        value,
                    },
                    function(response) {
                        app.log(response, 'Transaction requested');
                        if (response.success) {
                            signer.executeTransaction(response.result.transactionRequestId)
                                  .then(function(result) {
                                      app.log(result);
                                  })
                                  .catch(function(err) {
                                      app.error(err);
                                  });
                        }
                    }
                )
            );
        });


        // var formExecGo = document.querySelector('[data-form="execute"][data-chain="GOCHAIN"]');
        // formExecGo.addEventListener('submit', function(e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     var data = $('textarea[name="data"]', formExecGo).val() || null;
        //     var walletId = $('select[name="walletId"]', formExecGo).val();
        //     var to = $('input[name="to"]', formExecGo).val();
        //     var value = $('input[name="value"]', formExecGo).val();
        //     var tokenAddress = $('input[name="tokenAddress"]', formExecGo).val();
        //
        //     // Generic transaction
        //     executeTransaction({
        //                            secretType: 'GOCHAIN',
        //                            walletId,
        //                            to,
        //                            value,
        //                            tokenAddress,
        //                            data
        //                        });
        // });
        //
        // var formExecVechain = document.querySelector('[data-form="execute"][data-chain="VECHAIN"]');
        // formExecVechain.addEventListener('submit', function(e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     var data = $('textarea[name="data"]', formExecVechain).val() || null;
        //     var walletId = $('select[name="walletId"]', formExecVechain).val();
        //     var to = $('input[name="to"]', formExecVechain).val();
        //     var value = $('input[name="value"]', formExecVechain).val();
        //     var tokenAddress = $('input[name="tokenAddress"]', formExecVechain).val();
        //
        //     // Generic transaction
        //     executeTransaction({
        //                            secretType: 'VECHAIN',
        //                            walletId,
        //                            to,
        //                            value,
        //                            tokenAddress,
        //                            data
        //                        });
        //
        //     // Native VET transaction
        //     // executeNativeTransaction(
        //     //     {
        //     //         type: 'VET_TRANSACTION',
        //     //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //     //         clauses: [{
        //     //             to: $("#execute-VECHAIN-form input[name='to']").val(),
        //     //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
        //     //             data: data ? data : null,
        //     //         }]
        //     //     }
        //     // );
        //
        //     // Native VIP180 transaction
        //     // executeNativeTransaction(
        //     //     {
        //     //         type: 'VECHAIN_VIP180_TRANSACTION',
        //     //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //     //         clauses: [{
        //     //             to: $("#execute-VECHAIN-form input[name='to']").val(),
        //     //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
        //     //             tokenAddress: '0x9c6e62b3334294d70c8e410941f52d482557955b',
        //     //         }]
        //     //     }
        //     // );
        // });
        //
        // var formExecBitcoin = document.querySelector('[data-form="execute"][data-chain="BITCOIN"]');
        // formExecBitcoin.addEventListener('submit', function(e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     var walletId = $('select[name="walletId"]', formExecBitcoin).val();
        //     var to = $('input[name="to"]', formExecBitcoin).val();
        //     var value = $('input[name="value"]', formExecBitcoin).val();
        //
        //     // Generic transaction
        //     executeTransaction({
        //                            secretType: 'BITCOIN',
        //                            walletId,
        //                            to,
        //                            value,
        //                        });
        //
        //
        //     // Native BITCOIN transaction
        //     // executeNativeTransaction({
        //     //     type: 'BTC_TRANSACTION',
        //     //     walletId: $('#execute-BITCOIN-form select[name=\'walletId\']').val(),
        //     //     to: $('#execute-BITCOIN-form input[name=\'to\']').val(),
        //     //     value: $('#execute-BITCOIN-form input[name=\'value\']').val(),
        //     // });
        // });
        //
        // var formExecLitecoin = document.querySelector('[data-form="execute"][data-chain="LITECOIN"]');
        // formExecLitecoin.addEventListener('submit', function(e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     var walletId = $('select[name="walletId"]', formExecLitecoin).val();
        //     var to = $('input[name="to"]', formExecLitecoin).val();
        //     var value = $('input[name="value"]', formExecLitecoin).val() / Math.pow(10, 8);
        //
        //     // Generic transaction
        //     executeTransaction({
        //                            secretType: 'LITECOIN',
        //                            walletId,
        //                            to,
        //                            value,
        //                        });
        // });
    };

    app.requestApplicationBearerToken = function(callback) {
        var tokenRequest = new XMLHttpRequest();
        tokenRequest.withCredentials = true;
        tokenRequest.addEventListener('readystatechange', function() {
            if (this.readyState === 4) {
                const response = JSON.parse(this.responseText);
                app.log(response, 'Application token requested');
                callback(response);
            }
        });
        tokenRequest.open('POST', `${app.environment.login}/auth/realms/Arkane/protocol/openid-connect/token`);
        tokenRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        tokenRequest.send(`grant_type=client_credentials&client_id=Arketype_app&client_secret=${app.environment.arketypeClientSecret}`);
    };

    app.requestTransaction = function(request, callback) {
        return function(token) {
            var txRequest = new XMLHttpRequest();
            // txRequest.withCredentials = true;
            txRequest.addEventListener("readystatechange", function() {
                if (this.readyState === 4) {
                    callback(JSON.parse(this.responseText));
                }
            });
            txRequest.open("POST", `${app.environment.api}/api/transactions`);
            txRequest.setRequestHeader("Content-Type", "application/json");
            txRequest.setRequestHeader("Authorization", "Bearer " + token.access_token);
            txRequest.send(JSON.stringify(request));
        };
    };

    app.handleSignerTypeSwitch = function() {
        document.getElementById('signer-type').addEventListener('change', function(e) {
            window.arkaneConnect.signUsing = e.target.value;
        });
    };

    function logger(txt, title, type) {
        if (typeof type === 'undefined') {
            type = 'info';
        }
        if (isObject(txt)) {
            txt = JSON.stringify(txt, null, 2);
        }
        var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        var result = '<span class="text-' + type + '">';
        result = result + '[' + date + ']';
        result = result + (title ? ': <strong >' + title + '</strong>' : '');
        result = result + '</span>\n' + txt + '\n\n';
        var $appLog = $('#appLog');
        $appLog.html(result + $appLog.html());
    }

    app.log = function(txt, title) {
        logger(txt, title)
    };

    app.error = function(txt, title) {
        logger(txt, title, 'danger')
    };

    app.clearLog = function() {
        $('#appLog').html('');
    };

    app.getQueryParam = function(name) {
        const url = new URL(window.location.href);
        const params = url.searchParams.getAll(name);
        if (params.length > 0) {
            return params[params.length - 1];
        } else {
            return null;
        }
    };

    function isObject(obj) {
        return obj === Object(obj);
    }

    $(function() {
        app.initApp();
    });

})();
