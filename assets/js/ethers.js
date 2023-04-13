import { defaultParams } from "../constants/ethers-params.js";

(function () {
  'use strict';
  
  app.initApp = function () {
    $('#documentation').load('/assets/docs/ethersjs.html');
    app.page = app.page || {};
        app.secretType = 'ETHEREUM';
        $('.auth-loginlink').on('click', function (event) {
            let idpHint = $(this).data('idp-hint');
            let options = {
                clientId: 'Arketype',
                environment: app.env,
                secretType: app.secretType
            };
            if (idpHint) {
                options.authenticationOptions = {idpHint: idpHint}
            }

            console.log('initializing ethers provider with', options);
            Venly.createProviderEngine(options)
                .then(function (provider) {
                    handleLoaded(provider);
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
                                console.log('Something went wrong while creating the Venly provider', reason);
                        }
                    } else {
                        console.log('Something went wrong while creating the Venly provider');
                    }
                });
        });

        $(app).on('authenticated', function () {
            getWallets();
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
                handleLoaded(provider);
                getWallets();
            });

        });
    };

    function handleLoaded(provider) {
        window.provider = new window.ethers.providers.Web3Provider(provider);
        window.signer = window.provider.getSigner();
        app.log(window.ethers.version, 'ethers version');
        window.provider.getNetwork().then(network => {
          app.log(network.chainId, 'ChainID');
        });
    }

    function handleAuthenticated() {
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $(app).trigger('authenticated');
    }

    function getWallets() {
        window.provider.send('eth_requestAccounts').then(wallets => {
          app.log(wallets, 'Wallets');
          updateWallets(wallets);
        });
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
        $('select[name="method"]', signForm).on('change', function() {
          $('[name="params"]').val(defaultParams[this.value]);
          document.querySelector(`[name="${this.value.split('.').join('-')}"]`).scrollIntoView({ behavior: 'instant' });
          $('select[name="from"]').trigger('change');
        });

        $('select[name="from"]', signForm).on('change', function() {
          const params = $('[name="params"]');
          const value = params.val();
          if (value.startsWith('{'))
            params.val(value.replace(/"from": "(.*?)"/, `"from": "${this.value}"`));
          else
            params.val(value.replace(/"(address|loading...)"/g, `"${this.value}"`));
        });

        signForm.addEventListener('submit', async function (e) {
          e.stopPropagation();
          e.preventDefault();
          //add this if a popup blocker is being triggered
          //window.Venly.connect().createSigner();
          const submit = $('button[type="submit"]', signForm);
          const method = $('[name="method"]', signForm).val();

          try {
            const params = $('[name="params"]', signForm).val();
            const args = JSON.parse('[' + params + ']');
            submit.attr('disabled', true);

            let fn = window;
            let split = method.split('.');
            for (let item of split)
              fn = fn[item];
            const res = await fn.apply(window[split[0]], args);
            showModal('Result', JSON.stringify(res, null, 2));
            app.log(res, method);
            console.log(args);
            if (args[0]?.method == 'wallet_switchEthereumChain') {
              handleLoaded(Venly._provider);
            }
            submit.removeAttr('disabled');
          }
          catch (err) {
            showModal('Error', err.message || JSON.stringify(err, null, 2));
            app.error("error: " + err.message || JSON.stringify(err), method);
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
