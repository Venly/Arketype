(function() {
    'use strict';

    var txRequestTemplate =
        '<div class="card mb-3">' +
        '   <div class="card-body">' +
        '       <div class="row">' +
        '           <div class="col-sm-2">' +
        '               <button type="button" data-btn="confirm" class="btn btn-primary mb-1 btn-block">Confirm Transaction</button>' +
        // '               <button type="button" data-btn="delete" class="btn btn-secondary mb-1 btn-block">Delete Transaction</button>' +
        '           </div>' +
        '           <div class="col-sm-5">' +
        '               <dl class="row" data-row="tx-id">' +
        '                   <dt class="col-sm-3">Transaction ID</dt>' +
        '                   <dd class="col-sm-9 "></dd>' +
        '               </dl>' +
        '               <dl class="row" data-row="wallet">' +
        '                   <dt class="col-sm-3">Wallet</dt>' +
        '                   <dd class="col-sm-9"></dd>' +
        '               </dl>' +
        '               <dl class="row" data-row="to">' +
        '                   <dt class="col-sm-3">To</dt>' +
        '                   <dd class="col-sm-9 "></dd>' +
        '               </dl>' +
        '           </div>' +
        '           <div class="col-sm-5">' +
        '               <dl class="row" data-row="type">' +
        '                   <dt class="col-sm-3">Type</dt>' +
        '                   <dd class="col-sm-9 "></dd>' +
        '               </dl>' +
        '               <dl class="row" data-row="token-address">' +
        '                   <dt class="col-sm-3">Token addres</dt>' +
        '                   <dd class="col-sm-9 "></dd>' +
        '               </dl>' +
        '               <dl class="row" data-row="amount">' +
        '                   <dt class="col-sm-3">Amount</dt>' +
        '                   <dd class="col-sm-9 "></dd>' +
        '               </dl>' +
        '               <dl class="row" data-row="data">' +
        '                   <dt class="col-sm-3">Data</dt>' +
        '                   <dd class="col-sm-9 "></dd>' +
        '               </dl>' +
        '           </div>' +
        '       </div>' +
        '   </div>' +
        '</div>';

    var eventNames = {
        applicationTokenRequested: 'applicationTokenRequested',
        transactionRequested: 'transactionRequested',
    };

    $(function() {
        $(app).on('authenticated', function() {
            window.arkaneConnect.api.getWallets({walletType: 'APPLICATION'})
                  .then(function(wallets) {
                      app.log(wallets, 'Application wallets');
                      app.page.appWallets = wallets;
                      updateWallets(wallets);
                      if (!app.page.initialised) {
                        app.page.addConnectEvents('.get-app-wallets', getAppWallets);
                        initGetAppWalletEvent();
                        initCreateAppWalletEvent();
                        initRequestTransactionForm();
                        app.page.initialised = true;
                      }
                      refreshTransactionRequests();
                  });
        });
    });

    function getAppWallets(el) {
        window.arkaneConnect.api.getWallets({walletType: 'APPLICATION'})
              .then(function(wallets) {
                  if (el) {
                      el.dataset.success = 'true';
                  }
                  app.log(wallets, 'Application wallets');
                  updateWallets(wallets);
              });
    }

    function initGetAppWalletEvent() {
        document.querySelectorAll('.get-app-wallets')
                .forEach(function(el) {
                    el.addEventListener('click', function() {
                        getAppWallets(el);
                    });
                });
    }

    function initCreateAppWalletEvent() {
        document.querySelectorAll('.create-app-wallet').forEach(function(el) {
            el.addEventListener('click', async function() {
                const secretType = $('select[name="type"]').val();
                if (secretType) {
                    const signer = window.arkaneConnect.createSigner();
                    const newWallet = await signer.confirm({
                                                               secretType: secretType,
                                                               confirmationRequestType: 'CREATE_APPLICATION_WALLET'
                                                           });
                    app.log(newWallet, "New wallet created");
                    getAppWallets();

                } else {
                    app.error('', 'First select a chain type');
                }
            });
        });
    }

    function initRequestTransactionForm() {
        var formRequestTx = document.querySelector('[data-form="request"]');
        if (formRequestTx) {
            initializeTypeSelect(formRequestTx);

            formRequestTx.addEventListener('submit', function(e) {
                e.stopPropagation();
                e.preventDefault();

                var secretType = $('select[name="type"]', formRequestTx).val();
                var walletId = $('select[name="walletId"]', formRequestTx).val();
                var to = $('input[name="to"]', formRequestTx).val();
                var tokenAddress = $('input[name="tokenAddress"]', formRequestTx).val();
                var data = $('textarea[name="data"]', formRequestTx).val() || null;
                var value = $('input[name="value"]', formRequestTx).val();

                requestApplicationBearerToken({secretType, data, walletId, to, value, tokenAddress});
            });

            $(app).on(eventNames.applicationTokenRequested, function(event, eventData) {
                requestTransaction(eventData.token, {
                                       secretType: eventData.secretType,
                                       walletId: eventData.walletId,
                                       to: eventData.to,
                                       tokenAddress: eventData.tokenAddress,
                                       value: eventData.value,
                                       data: eventData.data,
                                   }
                )
            });

            $(app).on(eventNames.transactionRequested, function(event, response) {
                app.log(response, 'Transaction requested');
                if (response.success) {
                    refreshTransactionRequests();
                } else {
                    app.error(response.errors, 'Transaction request Failed');
                }
            });
        }
    }

    function initializeTypeSelect(formRequestTx) {
        var secretTypeSelector = $('select[name="type"]', formRequestTx);
        window.arkaneConnect.api.getAvailableSecretTypes()
              .then(secretTypes => secretTypes.forEach(secretType => secretTypeSelector.append(`<option value="${secretType}">${secretType}</option>`)));
        secretTypeSelector.on('change', function(e) {
            updateWallets(app.page.appWallets);
        });
    }

    function updateWallets(wallets) {
        const walletsSelect = $('select[name="walletId"]');
        walletsSelect && walletsSelect.empty();
        const selectedSecretType = $('select[name="type"]').val();
        if (selectedSecretType && wallets) {
            wallets.filter(wallet => wallet.secretType === selectedSecretType)
                   .forEach(wallet => walletsSelect.append($(
                       '<option>',
                       {value: wallet.id, text: buildWalletLabel(wallet), 'data-address': wallet.address}
                   )));
        }
    }

    function refreshTransactionRequests() {
        var pendingTransactions = $('[data-list="pending-transactions"]');
        pendingTransactions.empty();
        window.arkaneConnect.api.getPendingTransactions()
              .then((transactionRequests) => {
                  app.log(transactionRequests, 'Pending transaction requests');
                  if (transactionRequests) {
                      transactionRequests.forEach((transactionRequest) => {
                          var listItem = buildTransactionRequestListItem(transactionRequest);
                          pendingTransactions.append(listItem);
                      });
                  }
              })
              .catch(reason => {
                  app.error(reason, 'Fetching of pending transaction requests failed');
              });
    }

    function buildTransactionRequestListItem(transactionRequest) {
        const txRequestCard = $(txRequestTemplate);
        $('[data-row="tx-id"] > dd', txRequestCard).text(transactionRequest.id);
        $('[data-row="wallet"] > dd', txRequestCard).text(buildWalletLabel(app.page.appWallets.find(wallet => wallet.id === transactionRequest.walletId)));
        $('[data-row="to"] > dd', txRequestCard).text(transactionRequest.to);
        $('[data-row="type"] > dd', txRequestCard).text(transactionRequest.type);
        $('[data-row="amount"] > dd', txRequestCard).text(transactionRequest.value);
        if (transactionRequest.tokenAddress) {
            $('[data-row="token-address"] > dd', txRequestCard).text(transactionRequest.tokenAddress);
        } else {
            $('[data-row="token-address"]', txRequestCard).remove();
        }
        if (transactionRequest.data) {
            $('[data-row="data"] > dd', txRequestCard).text(transactionRequest.data);
        } else {
            $('[data-row="data"]', txRequestCard).remove();
        }
        const confirmButton = $('[data-btn="confirm"]', txRequestCard);
        confirmButton.on('click', function() {
            submitRequest(transactionRequest.id);
        });
        return txRequestCard;
    }

    function submitRequest(transactionRequestId) {
        const signer = window.arkaneConnect.createSigner();
        signer.executeTransaction(transactionRequestId)
              .then(function(result) {
                  app.log(result);
                  refreshTransactionRequests();
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function buildWalletLabel(wallet) {
        return wallet.description ? wallet.description + ' - ' + wallet.address : wallet.address;
    }

    function requestApplicationBearerToken(eventData) {
        var tokenRequest = new XMLHttpRequest();
        tokenRequest.withCredentials = true;
        tokenRequest.addEventListener('readystatechange', function() {
            if (this.readyState === 4) {
                const response = JSON.parse(this.responseText);
                app.log(response, 'Application token requested');
                $(app).trigger(eventNames.applicationTokenRequested, {token: response, ...eventData});
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
})();
