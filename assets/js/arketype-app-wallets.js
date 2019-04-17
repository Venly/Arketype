(function() {
    'use strict';

    window.app = window.app || {};

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

})();
