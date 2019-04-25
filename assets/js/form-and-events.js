(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};
    app.localStorageKeys = app.localStorageKeys  || {};
    app.localStorageKeys.activeChain = 'arketype.activeChain';

    var eventNames = {
        applicationTokenRequested: 'applicationTokenRequested',
        transactionRequested: 'transactionRequested',
    };

    app.page.addConnectEvents = function(getWalletsButtonSelector, getWalletsCallback) {
        app.page.initTabChangeEvent(getWalletsButtonSelector, getWalletsCallback);
        app.page.setActiveTab(app.page.getActiveTab(), true);
        app.page.initGetProfileEvent();

        app.page.initEthereum();
        app.page.initTron();
        app.page.initGo();
        app.page.initVechain();
        app.page.initBitcoin();
        app.page.initLitecoin();
    };

    app.page.initTabChangeEvent = function(selector, callback) {
        $('[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var button = document.querySelector($(e.target).attr('href') + ' ' + selector);
            if(button && button.dataset['success'] !== 'true') {
                if(localStorage && button.dataset.chain) {
                    app.page.setActiveTab(button.dataset.chain, false);
                }
                callback(button);
            }
        });
    };

    function sign(signData) {
        window.arkaneConnect.createSigner().sign(signData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

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

    function requestApplicationBearerToken(eventData) {
        var tokenRequest = new XMLHttpRequest();
        tokenRequest.withCredentials = true;
        tokenRequest.addEventListener('readystatechange', function() {
            if (this.readyState === 4) {
                const response = JSON.parse(this.responseText);
                app.log(response, 'Application token requested');
                $(app).trigger(eventNames.applicationTokenRequested, { token: response, ...eventData });
            }
        });
        tokenRequest.open('POST', `${app.environment.login}/auth/realms/Arkane/protocol/openid-connect/token`);
        tokenRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        tokenRequest.send(`grant_type=client_credentials&client_id=Arketype_app&client_secret=${app.environment.arketypeClientSecret}`);
    }

    function requestTransaction(token, request) {
        var txRequest = new XMLHttpRequest();
        // txRequest.withCredentials = true;
        txRequest.addEventListener("readystatechange", function() {
            if (this.readyState === 4) {
                $(app).trigger(eventNames.transactionRequested, (JSON.parse(this.responseText)));
            }
        });
        txRequest.open("POST", `${app.environment.api}/api/transactions`);
        txRequest.setRequestHeader("Content-Type", "application/json");
        txRequest.setRequestHeader("Authorization", "Bearer " + token.access_token);
        txRequest.send(JSON.stringify(request));
    }

    app.page.updateWallets = function(wallets, secretType) {
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
    };

    app.page.setActiveTab = function(secretType, selectTab) {
        if(typeof secretType !== 'undefined') {
            if(localStorage) {
                localStorage.setItem(app.localStorageKeys.activeChain, secretType);
            }
            if(selectTab) {
                $('#nav-' + secretType + '-tab').trigger('click');
            }
        }
    };

    app.page.getActiveTab = function() {
        return (localStorage && localStorage.getItem(app.localStorageKeys.activeChain)) || 'ETHEREUM';
    };

    app.page.initGetProfileEvent = function() {
        document.getElementById('get-profile').addEventListener('click', function() {
            window.arkaneConnect.api.getProfile().then(function(e) {
                app.log(e);
            });
        });
    };

    function getDataFromForm(form) {
        var data = $('textarea[name="data"]', form).val() || null;
        var walletId = $('select[name="walletId"]', form).val() || null;
        var to = $('input[name="to"]', form).val() || null;
        var value = $('input[name="value"]', form).val() || null;
        var tokenAddress = $('input[name="tokenAddress"]', form).val() || null;

        var result = {
            walletId,
            to,
            value,
            tokenAddress,
            data
        };

        var $hash = $('input[name="hash"]', form);
        $hash.length > 0 ? result.hash = $hash.is(':checked') : null;
        var $prefix = $('input[name="prefix"]', form);
        $prefix.length > 0 ? result.prefix = $prefix.is(':checked') : null;

        return result;
    }

    app.page.initEthereum = function() {
        var formSignEth = document.querySelector('[data-form="sign"][data-chain="ETHEREUM"]');
        formSignEth && formSignEth.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formSignEth);
            sign({
                     type: 'ETHEREUM_TRANSACTION',
                     walletId: formData.walletId,
                     submit: false,
                     to: formData.to,
                     value: formData.value,
                     data: formData.data
                 });
        });

        var formSignEthRaw = document.querySelector('[data-form="sign-raw"][data-chain="ETHEREUM"]');
        formSignEthRaw && formSignEthRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formSignEthRaw);
            sign({
                     type: 'ETHEREUM_RAW',
                     walletId: formData.walletId,
                     data: formData.data,
                     prefix: formData.prefix,
                     hash: formData.prefix ? true : formData.hash,
                 });
        });

        var formExecEth = document.querySelector('[data-form="execute"][data-chain="ETHEREUM"]');
        formExecEth && formExecEth.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formExecEth);
            // Generic transaction
            executeTransaction({
                                   secretType: 'ETHEREUM',
                                   walletId: formData.walletId,
                                   to: formData.to,
                                   value: formData.value,
                                   tokenAddress: formData.tokenAddress,
                                   data: formData.data
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
    };

    app.page.initTron = function() {
        var formSignTrx = document.querySelector('[data-form="sign"][data-chain="TRON"]');
        formSignTrx && formSignTrx.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formSignTrx).val();
            var to = $('input[name="to"]', formSignTrx).val();
            var value = $('input[name="value"]', formSignTrx).val();
            sign({
                     type: 'TRON_TRANSACTION',
                     walletId,
                     submit: false,
                     to,
                     value,
                 });
        });

        var formSignTronRaw = document.querySelector('[data-form="sign-raw"][data-chain="TRON"]');
        formSignTronRaw && formSignTronRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formSignTronRaw);
            sign({
                     type: 'TRON_RAW',
                     walletId: formData.walletId,
                     data: formData.data,
                 });
        });

        var formExecTrx = document.querySelector('[data-form="execute"][data-chain="TRON"]');
        formExecTrx && formExecTrx.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExecTrx).val() || null;
            var walletId = $('select[name="walletId"]', formExecTrx).val();
            var to = $('input[name="to"]', formExecTrx).val();
            var value = $('input[name="value"]', formExecTrx).val();
            var tokenAddress = $('input[name="tokenAddress"]', formExecTrx).val();

            // Generic transaction
            executeTransaction({
                                   secretType: 'TRON',
                                   walletId,
                                   to,
                                   value,
                                   tokenAddress,
                                   data
                               });
        });

        var formRequestTrx = document.querySelector('[data-form="request"][data-chain="TRON"]');
        formRequestTrx && formRequestTrx.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();

            var data = $('textarea[name="data"]', formRequestTrx).val() || null;
            var walletId = $('select[name="walletId"]', formRequestTrx).val();
            var to = $('input[name="to"]', formRequestTrx).val();
            var value = $('input[name="value"]', formRequestTrx).val() * 100000;
            // var tokenAddress = $('input[name="tokenAddress"]', formExecTrx).val();
            // tokenAddress,
            // data

            requestApplicationBearerToken( {
                data, walletId, to, value
            });
        });

        $(app).on(eventNames.applicationTokenRequested, function(event, eventData) {
            requestTransaction(
                eventData.token,
                {
                    type: 'TRX_TRANSACTION',
                    walletId: eventData.walletId,
                    to: eventData.to,
                    value: eventData.value,
                }
            )
        });

        $(app).on(eventNames.transactionRequested, function(event, response) {
            app.log(response, 'Transaction requested');
            if (response.success) {
                var template = '<li class="list-group-item" id="##TRANSACTION_REQUEST_ID##"><div class="input-group"><input class="form-control" type="text" disabled value="##TRANSACTION_REQUEST_ID##" /><div class="input-group-append"><button type="button" onclick="app.page.submitTronRequest(\'##TRANSACTION_REQUEST_ID##\')" class="btn btn-primary">Submit</button></div></div></li>';
                var listItem = template.replace(/##TRANSACTION_REQUEST_ID##/g, response.result.transactionRequestId);
                var $list = $('[data-list="sign-request"][data-chain="TRON"]');
                $list.find('[data-empty]').remove();
                $list.append($(listItem));
            } else {
                app.error(response.errors, 'Transaction request Failed');
            }
        });

        app.page.submitTronRequest = function(transactionRequestId) {
            const signer = window.arkaneConnect.createSigner();
            signer.executeTransaction(transactionRequestId)
                  .then(function(result) {
                      app.log(result);
                  })
                  .catch(function(err) {
                      app.error(err);
                  });
        };
    };

    app.page.initGo = function() {
        var formSignGo = document.querySelector('[data-form="sign"][data-chain="GOCHAIN"]');
        formSignGo && formSignGo.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignGo).val() || null;
            var walletId = $('select[name="walletId"]', formSignGo).val();
            var to = $('input[name="to"]', formSignGo).val();
            var value = $('input[name="value"]', formSignGo).val();
            sign({
                     type: 'GOCHAIN_TRANSACTION',
                     walletId,
                     submit: false,
                     to,
                     value,
                     data
                 });
        });

        var formSignGoRaw = document.querySelector('[data-form="sign-raw"][data-chain="GOCHAIN"]');
        formSignGoRaw && formSignGoRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignGoRaw).val() || null;
            var walletId = $('select[name="walletId"]', formSignGoRaw).val();
            sign({
                     type: 'GOCHAIN_RAW',
                     walletId,
                     data
                 });
        });

        var formExecGo = document.querySelector('[data-form="execute"][data-chain="GOCHAIN"]');
        formExecGo && formExecGo.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExecGo).val() || null;
            var walletId = $('select[name="walletId"]', formExecGo).val();
            var to = $('input[name="to"]', formExecGo).val();
            var value = $('input[name="value"]', formExecGo).val();
            var tokenAddress = $('input[name="tokenAddress"]', formExecGo).val();

            // Generic transaction
            executeTransaction({
                                   secretType: 'GOCHAIN',
                                   walletId,
                                   to,
                                   value,
                                   tokenAddress,
                                   data
                               });
        });
    };

    app.page.initVechain = function() {
        var formSignVechain = document.querySelector('[data-form="sign"][data-chain="VECHAIN"]');
        formSignVechain && formSignVechain.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignVechain).val() || null;
            var walletId = $('select[name="walletId"]', formSignVechain).val();
            var to = $('input[name="to"]', formSignVechain).val();
            var value = $('input[name="value"]', formSignVechain).val();
            sign({
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

        var formExecVechain = document.querySelector('[data-form="execute"][data-chain="VECHAIN"]');
        formExecVechain && formExecVechain.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExecVechain).val() || null;
            var walletId = $('select[name="walletId"]', formExecVechain).val();
            var to = $('input[name="to"]', formExecVechain).val();
            var value = $('input[name="value"]', formExecVechain).val();
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
    };

    app.page.initBitcoin = function() {
        var formExecBitcoin = document.querySelector('[data-form="execute"][data-chain="BITCOIN"]');
        formExecBitcoin && formExecBitcoin.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formExecBitcoin).val();
            var to = $('input[name="to"]', formExecBitcoin).val();
            var value = $('input[name="value"]', formExecBitcoin).val();

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

    app.page.initLitecoin = function() {
        var formExecLitecoin = document.querySelector('[data-form="execute"][data-chain="LITECOIN"]');
        formExecLitecoin && formExecLitecoin.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formExecLitecoin).val();
            var to = $('input[name="to"]', formExecLitecoin).val();
            var value = $('input[name="value"]', formExecLitecoin).val() / Math.pow(10, 8);

            // Generic transaction
            executeTransaction({
                                   secretType: 'LITECOIN',
                                   walletId,
                                   to,
                                   value,
                               });
        });
    };

})();
