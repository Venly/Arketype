import {defaultParams} from "../constants/params.js";

(function () {
  'use strict';
  
  app.initApp = function () {
    $('#documentation').load('/assets/docs/web3js.html');
    app.page = app.page || {};
        app.secretType = 'ETHEREUM';
        $('.auth-loginlink').on('click', function (event) {
            let idpHint = $(this).data('idp-hint');
            let options = {
                clientId: 'Arketype',
                environment: app.env,
                skipAuthentication: false,
                secretType: app.secretType
            };
            if (idpHint) {
                options.authenticationOptions = {idpHint: idpHint}
            }

            console.log('initializing arkane web3 provider with', options);
            Venly.createProvider(options)
                .then(function (provider) {
                    handleWeb3Loaded(provider);
                    handleAuthenticated();
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
                                console.log('Something went wrong while creating the Arkane provider', reason);
                        }
                    } else {
                        console.log('Something went wrong while creating the Arkane provider');
                    }
                });
        });

        $(app).on('authenticated', function () {
            window.web3.eth.requestAccounts(function (err, wallets) {
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
            let val = $('#network-mgmt-secret-type').find(":selected").val();
            console.log(val.toUpperCase(), 'switching');
            Venly.changeSecretType(val.toUpperCase()).then(provider => {
                app.secretType = val.toUpperCase();
                handleWeb3Loaded(provider);
                getWallets();
            });

        });
    };

    function handleWeb3Loaded(provider) {
        window.web3 = new Web3(provider);
        provider.on('chainChanged', (res) => {
            app.log(res, 'emit chainChanged');
        })
        .on('accountsChanged', (res) => {
            app.log(res, 'emit accountsChanged');
        });
        app.log(window.web3.version, 'web3 version');
        window.web3.eth.getChainId().then(network => {
            app.log(network, 'ChainID');
        });
    }

    function handleAuthenticated() {
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $(app).trigger('authenticated');
    }

    function getWallets(el) {
        window.web3.eth.requestAccounts(function (err, wallets) {
            app.log(wallets, 'Wallets');
            updateWallets(wallets);
        });
    }

    function initLogout() {
        $('#auth-logout').click(() => {
            window.Venly.logout()
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
            window.Venly.connect
                .linkWallets()
                .then(function () {
                    getWallets();
                });
        });
    }

    function initManageWallets() {
        $('#manage-wallets').click(() => {
            window.Venly.connect
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


    async function initRequestTransactionForm() {
      var signForm = document.querySelector('#sign-form');
      if (signForm) {            
        $('select[name="method"]', signForm).on('change', function() {
          $('[name="params"]').val(defaultParams[this.value]);
          $(`#web3-eth > .section`).hide();
          const sectionId = this.value.split('.').pop().toLowerCase();
          $(`#web3-eth > .section#${sectionId}`).show();
          $('select[name="from"]').trigger('change');
        });
        $('select[name="method"]', signForm).trigger('change');

        $('select[name="from"]', signForm).on('change', function() {
          const params = $('[name="params"]');
          const value = params.val();
          if (value.startsWith('{'))
            params.val(value.replace(/"from": "(.*?)"/, `"from": "${this.value}"`));
          else
            params.val(value.replace(/"(address|loading...)"/g, `"${this.value}"`));
        });

        signForm.addEventListener('submit', function (e) {
          e.stopPropagation();
          e.preventDefault();
          //add this if a popup blocker is being triggered
          //window.Venly.connect.createSigner();
          const submit = $('button[type="submit"]', signForm);
          const method = $('[name="method"]', signForm).val();

          try {
            const params = $('[name="params"]', signForm).val();
            const args = JSON.parse('[' + params + ']');
            submit.attr('disabled', true);

            let fn = window.web3;
            for (let split of method.split('.'))
              fn = fn[split];
            fn.apply(null, args).then(res => {
              showModal('Result', JSON.stringify(res, null, 2))
              app.log(res, method);
            }).catch((err) => {
              showModal('Error', err.message || JSON.stringify(err, null, 2));
              app.error("error: " + err.message || JSON.stringify(err), method);
            }).finally(() => submit.removeAttr('disabled'));
          }
          catch (err) {
            console.log(err.message);
            submit.removeAttr('disabled');
          }
        });
      }
    }

    function showModal(title, message) {
      const modal = $('#modal');
      $('.modal-title', modal).html(title);
      $('.modal-body', modal).html(message);
      modal.modal();
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
        walletsSelect.trigger('change');
    }

    function clearWallets() {
        const walletsSelect = $('select[name="from"]');
        walletsSelect && walletsSelect.empty();
    }

})();
