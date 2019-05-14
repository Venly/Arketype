(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};
    app.localStorageKeys = app.localStorageKeys || {};
    app.localStorageKeys.activeChain = 'arketype.activeChain';


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
        $('[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var button = document.querySelector($(e.target).attr('href') + ' ' + selector);
            if (button && button.dataset['success'] !== 'true') {
                if (localStorage && button.dataset.chain) {
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
        if (typeof secretType !== 'undefined') {
            if (localStorage) {
                localStorage.setItem(app.localStorageKeys.activeChain, secretType);
            }
            if (selectTab) {
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
        var formSign = document.querySelector('[data-form="sign"][data-chain="ETHEREUM"]');
        formSign && formSign.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formSign);
            sign({
                     type: 'ETHEREUM_TRANSACTION',
                     walletId: formData.walletId,
                     submit: false,
                     to: formData.to,
                     value: formData.value,
                     data: formData.data
                 });
        });

        var formSignRaw = document.querySelector('[data-form="sign-raw"][data-chain="ETHEREUM"]');
        formSignRaw && formSignRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formSignRaw);
            sign({
                     type: 'ETHEREUM_RAW',
                     walletId: formData.walletId,
                     data: formData.data,
                     prefix: formData.prefix,
                     hash: formData.prefix ? true : formData.hash,
                 });
        });

        var formExec = document.querySelector('[data-form="execute"][data-chain="ETHEREUM"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formExec);
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
        var formSign = document.querySelector('[data-form="sign"][data-chain="TRON"]');
        formSign && formSign.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formSign).val();
            var to = $('input[name="to"]', formSign).val();
            var value = $('input[name="value"]', formSign).val();
            sign({
                     type: 'TRON_TRANSACTION',
                     walletId,
                     submit: false,
                     to,
                     value,
                 });
        });

        var formSignRaw = document.querySelector('[data-form="sign-raw"][data-chain="TRON"]');
        formSignRaw && formSignRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var formData = getDataFromForm(formSignRaw);
            sign({
                     type: 'TRON_RAW',
                     walletId: formData.walletId,
                     data: formData.data,
                 });
        });

        var formExec = document.querySelector('[data-form="execute"][data-chain="TRON"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExec).val() || null;
            var walletId = $('select[name="walletId"]', formExec).val();
            var to = $('input[name="to"]', formExec).val();
            var value = $('input[name="value"]', formExec).val();
            var tokenAddress = $('input[name="tokenAddress"]', formExec).val();

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
    };

    app.page.initGo = function() {
        var formSign = document.querySelector('[data-form="sign"][data-chain="GOCHAIN"]');
        formSign && formSign.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSign).val() || null;
            var walletId = $('select[name="walletId"]', formSign).val();
            var to = $('input[name="to"]', formSign).val();
            var value = $('input[name="value"]', formSign).val();
            sign({
                     type: 'GOCHAIN_TRANSACTION',
                     walletId,
                     submit: false,
                     to,
                     value,
                     data
                 });
        });

        var formSignRaw = document.querySelector('[data-form="sign-raw"][data-chain="GOCHAIN"]');
        formSignRaw && formSignRaw.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSignRaw).val() || null;
            var walletId = $('select[name="walletId"]', formSignRaw).val();
            sign({
                     type: 'GOCHAIN_RAW',
                     walletId,
                     data
                 });
        });

        var formExec = document.querySelector('[data-form="execute"][data-chain="GOCHAIN"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExec).val() || null;
            var walletId = $('select[name="walletId"]', formExec).val();
            var to = $('input[name="to"]', formExec).val();
            var value = $('input[name="value"]', formExec).val();
            var tokenAddress = $('input[name="tokenAddress"]', formExec).val();

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
        var formSign = document.querySelector('[data-form="sign"][data-chain="VECHAIN"]');
        formSign && formSign.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSign).val() || null;
            var walletId = $('select[name="walletId"]', formSign).val();
            var to = $('input[name="to"]', formSign).val();
            var value = $('input[name="value"]', formSign).val();
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

        var formExec = document.querySelector('[data-form="execute"][data-chain="VECHAIN"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExec).val() || null;
            var walletId = $('select[name="walletId"]', formExec).val();
            var to = $('input[name="to"]', formExec).val();
            var value = $('input[name="value"]', formExec).val();
            var tokenAddress = $('input[name="tokenAddress"]', formExec).val();

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
        var formExec = document.querySelector('[data-form="execute"][data-chain="BITCOIN"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formExec).val();
            var to = $('input[name="to"]', formExec).val();
            var value = $('input[name="value"]', formExec).val();

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
        var formExec = document.querySelector('[data-form="execute"][data-chain="LITECOIN"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var walletId = $('select[name="walletId"]', formExec).val();
            var to = $('input[name="to"]', formExec).val();
            var value = $('input[name="value"]', formExec).val() / Math.pow(10, 8);

            // Generic transaction
            executeTransaction({
                                   secretType: 'LITECOIN',
                                   walletId,
                                   to,
                                   value,
                               });
        });
    };

    app.page.initAeternity = function() {
        var formSign = document.querySelector('[data-form="sign"][data-chain="AETERNITY"]');
        formSign && formSign.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formSign).val() || null;
            var walletId = $('select[name="walletId"]', formSign).val();
            var to = $('input[name="to"]', formSign).val();
            var value = $('input[name="value"]', formSign).val();
            sign({
                     type: 'AETERNITY_TRANSACTION',
                     walletId,
                     submit: false,
                     to,
                     value,
                     data
                 });
        });

        var formExec = document.querySelector('[data-form="execute"][data-chain="AETERNITY"]');
        formExec && formExec.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = $('textarea[name="data"]', formExec).val() || null;
            var walletId = $('select[name="walletId"]', formExec).val();
            var to = $('input[name="to"]', formExec).val();
            var value = $('input[name="value"]', formExec).val();
            var tokenAddress = $('input[name="tokenAddress"]', formExec).val();

            // Generic transaction
            executeTransaction({
                                   secretType: 'AETERNITY',
                                   walletId,
                                   to,
                                   value,
                                   tokenAddress,
                                   data
                               });
        });
    };
})();
