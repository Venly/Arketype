(function () {
    'use strict';

    app.initApp = function () {
        app.page = app.page || {};
        app.secretType = 'ETHEREUM';
        let idpHint = $(this).data('idp-hint');
        let options = {
            clientId: 'Arketype',
            environment: app.env,
            skipAuthentication: true,
            secretType: app.secretType
        };
        if (idpHint) {
            options.authenticationOptions = {idpHint: idpHint}
        }
        console.log('initializing venly web3 provider with', options);
        Venly.createProviderEngine(options)
            .then(function (provider) {
                window.web3 = new Web3(provider);
                handleWeb3Loaded();
            })
            .catch((reason) => {
                if (reason) {
                    switch (reason) {
                        case 'not-authenticated':
                            console.log('User is not authenticated (closed window?)', reason);
                            break;
                        case 'no-wallet-linked':
                            console.log('No wallet was linked to this application', reason);
                            break;
                        default:
                            console.log('Something went wrong while creating the Venly provider', reason);
                    }
                } else {
                    console.log('Something went wrong while creating the Venly provider');
                }
            });

        $('.auth-loginlink').on('click', function (event) {
            let idpHint = $(this).data('idp-hint');
            let authenticationOptions = {};
            if (idpHint) {
                authenticationOptions.idpHint = idpHint;
            }
            Venly.authenticate(authenticationOptions).then(account => {
                if (account) {
                    document.body.classList.remove('not-logged-in');
                    document.body.classList.add('logged-in');
                    $(app).trigger('authenticated');
                }
            })
        });

        function subscribeToBlockHeaders() {
            window.web3.eth.subscribe('newBlockHeaders', function (error, result) {
                if (!error) {
                    return;
                }
                console.error('weird, an error!', error);
            })
                .on("data", function (blockHeader) {
                    app.log(blockHeader.number, 'New block');
                })
                .on("error", console.error)
        }

        $(app).on('authenticated', function () {
            subscribeToBlockHeaders();

            window.web3.eth.requestAccounts().then(wallets => {
                app.log(wallets, 'Wallets');
                updateWallets(wallets);
            });

            if (!app.page.initialised) {
                initLogout();
                initWalletControls();
                initRequestTransactionForm();
                app.page.initialised = true;
            }
        });
        $('#btn-secret-type').on('click', function (event) {
            let val = $('#network-mgmt-secret-type').find(":selected").text();
            console.log(val.toUpperCase(), 'switching');
            Venly.changeSecretType(val.toUpperCase()).then(provider => {
                app.secretType = val.toUpperCase();
                window.web3 = new Web3(provider);
                handleWeb3Loaded();
                getWallets();
                subscribeToBlockHeaders();
            });

        });
    };

    function handleWeb3Loaded() {
        app.log(window.web3.version, 'web3 version');
        window.web3.eth.getChainId().then(network => {
            app.log(network, 'ChainID');
        });
        Venly.checkAuthenticated().then(authResult => {
            if (authResult.isAuthenticated) {
                document.body.classList.remove('not-logged-in');
                document.body.classList.add('logged-in');
                $(app).trigger('authenticated');
            }
        });
    }

    function getWallets(el) {
        window.web3.eth.requestAccounts(function (err, wallets) {
            app.log(wallets, 'Wallets');
            updateWallets(wallets);
        });
    }

    function changeSecretType() {
        Venly.changeSecretType()
    }

    function initLogout() {
        $('#auth-logout').click(() => {
            window.Venly.connect().logout()
                .then(() => {
                    document.body.classList.remove('logged-in');
                    document.body.classList.add('not-logged-in');
                    app.clearLog();
                    clearWallets();
                });
        });
    }

    function initWalletControls() {
        initLinkWallets();
        initManageWallets();
        initRefreshWallets();
    }

    function initLinkWallets() {
        $('#link-wallets').click(() => {
            window.Venly.connect()
                .linkWallets()
                .then(function () {
                    getWallets();
                });
        });
    }

    function initManageWallets() {
        $('#manage-wallets').click(() => {
            window.Venly.connect()
                .manageWallets(app.secretType)
                .then(function () {
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
            signForm.addEventListener('submit', function (e) {
                e.stopPropagation();
                e.preventDefault();
                //add this if a popup blocker is being triggered
                window.Venly.connect().createSigner();

                var rawTransaction = {
                    from: $('select[name="from"]', signForm).val(),
                    to: $('input[name="to"]', signForm).val(),
                    value: $('input[name="value"]', signForm).val(),
                    gas: $('input[name="gas"]', signForm).val() || undefined,
                    gasPrice: $('input[name="gas-price"]', signForm).val() || undefined,
                    nonce: $('input[name="nonce"]', signForm).val() || undefined,
                    data: $('textarea[name="data"]', signForm).val() || undefined,
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
            executeForm.addEventListener('submit', function (e) {
                e.stopPropagation();
                e.preventDefault();

                //add this if a popup blocker is being triggered
                window.Venly.connect().createSigner();

                var rawTransaction = {
                    from: $('select[name="from"]', executeForm).val(),
                    to: $('input[name="to"]', executeForm).val(),
                    value: $('input[name="value"]', executeForm).val(),
                    gas: $('input[name="gas"]', executeForm).val() || undefined,
                    gasPrice: $('input[name="gas-price"]', executeForm).val() || undefined,
                    nonce: $('input[name="nonce"]', executeForm).val() || undefined,
                    data: $('textarea[name="data"]', executeForm).val() || undefined,
                };
                window.web3.eth.sendTransaction(rawTransaction, function (err, hash) {
                    if (err) console.error(err);
                })
                    .on('transactionHash', function (hash) {
                        app.log(hash, 'Tx hash');
                    })
                    .on('receipt', function (receipt) {
                        app.log(receipt, 'Tx receipt');
                    })
                    .on('error', function (err) {
                        app.error("error: " + err.message ? err.message : JSON.stringify(err));
                    });

            });
        }

        var eip712Form = document.querySelector('#eip712-form');
        if (eip712Form) {
            eip712Form.addEventListener('submit', function (e) {
                e.stopPropagation();
                e.preventDefault();

                //add this if a popup blocker is being triggered
                window.Venly.connect().createSigner();

                const data = $('textarea[name="data"]', eip712Form).val();
                const signer = $('select[name="from"]', eip712Form).val()
                window.web3.currentProvider.sendAsync(
                    {
                        method: "eth_signTypedData_v3",
                        params: [signer, data],
                        from: signer
                    },
                    function (err, result) {
                        if (err || result.error) {
                            return console.error(result);
                        }
                        app.log(result, 'EIP712 signature');
                    }
                );
            });
        }

        var personalSignForm = document.querySelector('#personal-sign-form');
        if (personalSignForm) {
            personalSignForm.addEventListener('submit', function (e) {
                e.stopPropagation();
                e.preventDefault();

                //add this if a popup blocker is being triggered
                window.Venly.connect().createSigner();

                const data = $('textarea[name="data"]', personalSignForm).val();
                const signer = $('select[name="from"]', personalSignForm).val()
                window.web3.eth.sign(data, signer, function (err, result) {
                    if (err || result.error) {
                        return console.error(result);
                    }
                    app.log(result, 'Personal signature');
                })
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

    function clearWallets() {
        const walletsSelect = $('select[name="from"]');
        walletsSelect && walletsSelect.empty();
    }
})();
