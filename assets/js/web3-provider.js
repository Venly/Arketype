(function() {
    'use strict';

    app.initApp = function() {
        $('#auth-loginlink').on('click', function(event) {
            Arkane.createArkaneProviderEngine({
                                                  clientId: 'Arketype',
                                                  rpcUrl: 'https://kovan.infura.io',
                                                  environment: app.env,
                                              })
                  .then(function(provider) {
                      window.web3 = new Web3(provider);
                      handleAuthenticated();
                  })
                  .catch(reason => app.error(reason));
        });

        $(app).on('authenticated', function() {
            window.web3.eth.getAccounts(function(err, wallets) {
                app.log(wallets, 'Wallets');
                updateWallets(wallets);
            });
            initLogout();
            initWalletControls();
            initRequestTransactionForm();
        });
    };

    function handleAuthenticated() {
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $(app).trigger('authenticated');
    }

    function getWallets(el) {
        window.web3.eth.getAccounts(function(err, wallets) {
            app.log(wallets, 'Wallets');
            updateWallets(wallets);
        });
    }

    function initLogout() {
        $('#auth-logout').click(() => {
            window.Arkane.arkaneConnect().logout();
        });
    }

    function initWalletControls() {
        initLinkWallets();
        initManageWallets();
        initRefreshWallets();
    }

    function initLinkWallets() {
        $('#link-wallets').click(() => {
            window.Arkane.arkaneConnect()
                  .linkWallets()
                  .then(function() {
                      getWallets();
                  });
        });
    }

    function initManageWallets() {
        $('#manage-wallets').click(() => {
            window.Arkane.arkaneConnect()
                  .manageWallets('ETHEREUM')
                  .then(function() {
                      getWallets();
                  });
        });
    }

    function initRefreshWallets() {
        $('#refresh-wallets').click(() => {
            getWallets();
        });
    }


    function initRequestTransactionForm() {
        var signForm = document.querySelector('#sign-form');
        if (signForm) {
            signForm.addEventListener('submit', function(e) {
                e.stopPropagation();
                e.preventDefault();

                var rawTransaction = {
                    from: $('select[name="from"]', signForm).val(),
                    to: $('input[name="to"]', signForm).val(),
                    value: $('input[name="value"]', signForm).val(),
                    gas: $('input[name="gas"]', signForm).val(),
                    gasPrice: $('input[name="gas-price"]', signForm).val(),
                    nonce: $('input[name="nonce"]', signForm).val(),
                    data: $('textarea[name="data"]', signForm).val() || null,
                };

                window.web3.eth.signTransaction(rawTransaction, (err, result) => {
                    if (err) {
                        app.error("error: " + err.message ? err.message : JSON.stringify(err));
                    } else {
                        app.log(result);
                    }
                });
            });
        }

        var executeForm = document.querySelector('#execute-form');
        if (executeForm) {
            executeForm.addEventListener('submit', function(e) {
                e.stopPropagation();
                e.preventDefault();

                var rawTransaction = {
                    from: $('select[name="from"]', executeForm).val(),
                    to: $('input[name="to"]', executeForm).val(),
                    value: $('input[name="value"]', executeForm).val(),
                    gas: $('input[name="gas"]', executeForm).val(),
                    gasPrice: $('input[name="gas-price"]', executeForm).val(),
                    nonce: $('input[name="nonce"]', executeForm).val(),
                    data: $('textarea[name="data"]', executeForm).val() || null,
                };

                window.web3.eth.sendTransaction(rawTransaction, function(err, result) {
                    if (err) {
                        app.error("error: " + err.message ? err.message : JSON.stringify(err));
                    } else {
                        app.log(JSON.stringify(result));
                    }
                });
            });
        }
    }

    function updateWallets(wallets) {
        const walletsSelect = $('select[name="from"]');
        walletsSelect && walletsSelect.empty();
        if (wallets) {
            wallets.forEach(wallet => walletsSelect.append($(
                '<option>',
                {value: wallet, text: wallet, 'data-address': wallet}
            )));
        }
    }
})();
