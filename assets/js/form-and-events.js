(function() {
    'use strict';

    window.app = window.app || {};
    app.page = app.page || {};
    app.localStorageKeys = app.localStorageKeys || {};
    app.localStorageKeys.activeChain = 'arketype.activeChain';


    app.page.addConnectEvents = function(getWalletsButtonSelector,
                                         getWalletsCallback) {
        app.page.initTabChangeEvent(getWalletsButtonSelector, getWalletsCallback);
        app.page.setActiveTab(app.page.getActiveTab(), true);
        app.page.initGetProfileEvent();

        app.page.initAeternity();
        app.page.initEthereum();
        app.page.initMatic();
        app.page.initBsc();
        app.page.initAvac();
        app.page.initTron();
        app.page.initGo();
        app.page.initVechain();
        app.page.initBitcoin();
        app.page.initLitecoin();
        app.page.initNeo();
        app.page.initHedera();
        app.page.initialised = true;
    };

    app.page.initTabChangeEvent = function(selector,
                                           callback) {
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
        console.debug('Signing', signData);
        window.venlyConnect.createSigner().sign(signData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function signMessage(message) {
        console.debug('Signing message', message);
        window.venlyConnect.createSigner().signMessage(message)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function signEip712(data) {
        console.log('Signing eip712 message', data);
        window.venlyConnect.createSigner().signEip712(data)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeTransaction(executeData) {
        let token = executeData.tokenAddress;
        if (token && token.length > 0) {
            executeTokenTransfer(executeData);
        } else {
            executeTransfer(executeData);
        }
    }

    function executeTransfer(executeData) {
        console.debug('Executing transaction', executeData);
        window.venlyConnect.createSigner().executeTransfer(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeTokenTransfer(executeData) {
        console.debug('Executing token transaction', executeData);
        window.venlyConnect.createSigner().executeTokenTransfer(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeGasTransaction(executeData) {
        console.debug('Executing gas transaction', executeData);
        window.venlyConnect.createSigner().executeGasTransfer(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeContract(executeData) {
        console.debug('Executing contract', executeData);
        window.venlyConnect.createSigner().executeContract(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function readContract(readData) {
        console.debug('Reading contract', readData);
        window.venlyConnect.api.readContract(readData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeNativeTransaction(executeData) {
        console.debug('Executing native transaction', executeData);
        window.venlyConnect.createSigner().executeNativeTransaction(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function importWallet(request) {
        console.debug('Importing wallet', request);
        window.venlyConnect.createSigner().importWallet(request)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    app.page.updateWallets = function(wallets,
                                      secretType) {
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

    app.page.setActiveTab = function(secretType,
                                     selectTab) {
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
            window.venlyConnect.api.getProfile().then(function(e) {
                app.log(e);
            });
        });
    };

    app.page.initEthereum = function() {
        var secretType = 'ETHEREUM';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x680800Dd4913021821A9C08D569eF4338dB8E9f6'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '31400000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {type: 'input', label: 'Network node URL', placeholder: 'e.g. https://rinkeby.infura.io', network: true},
        };
        createSignForm(secretType, 'ETHEREUM_TRANSACTION', fields);

        createSignRawForm(secretType, 'ETHEREUM_RAW', {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some test data'}),
            prefix: {type: 'checkbox', checked: true, label: 'Prefix'},
            hash: {
                type: 'checkbox',
                checked: true,
                label: 'Hash',
                info: 'When prefix is checked, hash will always be set to \'true\''
            }
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message', placeholder: '{}'}),
        });

        createSignEip712(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {
                defaultValue: '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"},{"name":"salt","type":"bytes32"}],"Bid":[{"name":"amount","type":"uint256"},{"name":"bidder","type":"Identity"}],"Identity":[{"name":"userId","type":"uint256"},{"name":"wallet","type":"address"}]},"domain":{"name":"My amazing dApp","version":"2","chainId":1,"verifyingContract":"0x1C56346CD2A2Bf3202F771f50d3D14a367B48070","salt":"0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"},"primaryType":"Bid","message":{"amount":100,"bidder":{"userId":323,"wallet":"0x3333333333333333333333333333333333333333"}}}',
                label: 'Data',
                json: true
            }),
        });

        createExecuteContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'Contract Address', defaultValue: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '0'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            inputs: {
                type: 'textarea',
                label: 'Inputs',
                defaultValue: '[{"type": "address", "value": "0xd82049204D8514c637f150C7231BFefC5C4937Ec"},{"type": "uint256", "value": "0"}]'
            },
            chainSpecificFields: {type: 'textarea', label: 'Chain specific fields', defaultValue: '{"gasLimit": 200000, "gasPrice": 10000000000}', dataName: 'chainSpecific'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {type: 'input', label: 'Network node URL', placeholder: 'e.g. https://rinkeby.infura.io', network: true}
        });

        createExecuteForm(secretType, {
            walletId: fields.walletId,
            to: fields.to,
            value: {type: 'input', label: 'Amount (in ETH)', defaultValue: '0.0314'},
            tokenAddress: {type: 'input', label: 'Token address', placeholder: 'e.g. 0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570'},
            data: fields.data,
            name: fields.name,
            nodeUrl: fields.nodeUrl,
        });

        createImportWalletForm(secretType, {
            walletId: fields.walletId,
            to: {type: 'secret-type-select', label: 'To chain', defaultValue: 'MATIC', values: ['MATIC', 'BSC']},
        })
    };

    app.page.initMatic = function() {
        var secretType = 'MATIC';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x680800Dd4913021821A9C08D569eF4338dB8E9f6'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '31400000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {type: 'input', label: 'Network node URL', placeholder: 'e.g. https://rinkeby.infura.io', network: true},
        };
        createSignForm(secretType, 'MATIC_TRANSACTION', fields);

        createSignRawForm(secretType, 'MATIC_RAW', {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some test data'}),
            prefix: {type: 'checkbox', checked: true, label: 'Prefix'},
            hash: {type: 'checkbox', checked: true, label: 'Hash', info: 'When prefix is checked, hash will always be set to \'true\''}
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });

        createExecuteContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'Contract Address', defaultValue: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '0'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            inputs: {
                type: 'textarea',
                label: 'Inputs',
                defaultValue: '[{"type": "address", "value": "0xd82049204D8514c637f150C7231BFefC5C4937Ec"},{"type": "uint256", "value": "0"}]'
            },
            chainSpecificFields: {type: 'textarea', label: 'Chain specific fields', defaultValue: '{"gasLimit": 200000, "gasPrice": 0}', dataName: 'chainSpecific'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {type: 'input', label: 'Network node URL', placeholder: 'e.g. https://rinkeby.infura.io', network: true}
        });

        createReadContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            contractAddress: {type: 'input', label: 'Contract Address', defaultValue: '0x78cB9c3977382d699EF458C071A3353A4553EF49'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'isApprovedForAll'},
            inputs: {
                type: 'textarea',
                label: 'Inputs',
                defaultValue: '[{"type": "address", "value": "0xA00Fe54522ab6100cdE81635A1DB78d7067D75FA"},{"type": "address", "value": "0x1ac1ca3665b5cd5fdd8bc76f924b76c2a2889d39"}]'
            },
            outputs: {
                type: 'textarea',
                label: 'Outputs',
                defaultValue: '[{"type": "bool"}]'
            }
        });

        fields.tokenAddress = {
            type: "input",
            label: "Token Address (optional)",
        };
        createExecuteForm(secretType, {
            walletId: fields.walletId,
            to: fields.to,
            value: {type: 'input', label: 'Amount (in MATIC)', defaultValue: '0.0314'},
            tokenAddress: {
                type: 'input',
                label: 'Token address',
                placeholder: 'e.g. 0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570'
            },
            data: fields.data,
            name: fields.name,
            nodeUrl: fields.nodeUrl,
        });

        createImportWalletForm(secretType, {
            walletId: fields.walletId,
            to: {type: 'secret-type-select', label: 'To chain', defaultValue: 'ETHEREUM', values: ['ETHEREUM']},
        })
    };

    app.page.initBsc = function() {
        var secretType = 'BSC';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x680800Dd4913021821A9C08D569eF4338dB8E9f6'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '31400000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {
                type: 'input',
                label: 'Network node URL',
                placeholder: 'e.g. https://rinkeby.infura.io',
                network: true
            },
        };
        createSignForm(secretType, 'BSC_TRANSACTION', fields);

        createSignRawForm(secretType, 'BSC_RAW', {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some test data'}),
            prefix: {type: 'checkbox', checked: true, label: 'Prefix'},
            hash: {
                type: 'checkbox',
                checked: true,
                label: 'Hash',
                info: 'When prefix is checked, hash will always be set to \'true\''
            }
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });

        createSignEip712(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {
                defaultValue: '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"},{"name":"salt","type":"bytes32"}],"Bid":[{"name":"amount","type":"uint256"},{"name":"bidder","type":"Identity"}],"Identity":[{"name":"userId","type":"uint256"},{"name":"wallet","type":"address"}]},"domain":{"name":"My amazing dApp","version":"2","chainId":1,"verifyingContract":"0x1C56346CD2A2Bf3202F771f50d3D14a367B48070","salt":"0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"},"primaryType":"Bid","message":{"amount":100,"bidder":{"userId":323,"wallet":"0x3333333333333333333333333333333333333333"}}}',
                label: 'Data',
                json: true
            }),
        })

        createExecuteContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'Contract Address', defaultValue: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '0'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            inputs: {
                type: 'textarea',
                label: 'Inputs',
                defaultValue: '[{"type": "address", "value": "0xa7ce868f6490186ac57fa12174df770672ec0950"},{"type": "uint256", "value": "0"}]'
            },
            chainSpecificFields: {
                type: 'textarea',
                label: 'Chain specific fields',
                defaultValue: '{"gasLimit": 145000, "gasPrice": 20000000000}',
                dataName: 'chainSpecific'
            },
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. TestNet', network: true},
            nodeUrl: {
                type: 'input',
                label: 'Network node URL',
                placeholder: 'e.g. https://testnet-bsc.arkane.network',
                network: true
            }
        });

        fields.tokenAddress = {
            type: "input",
            label: "Token Address (optional)",
        };
        createExecuteForm(secretType, {
            walletId: fields.walletId,
            to: fields.to,
            value: {type: 'input', label: 'Amount (in BSC)', defaultValue: '0.0314'},
            tokenAddress: {
                type: 'input',
                label: 'Token address',
                placeholder: 'e.g. 0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570'
            },
            data: fields.data,
            name: fields.name,
            nodeUrl: fields.nodeUrl,
        });

        createImportWalletForm(secretType, {
            walletId: fields.walletId,
            to: {type: 'secret-type-select', label: 'To chain', defaultValue: 'ETHEREUM', values: ['ETHEREUM']},
        })
    };

    app.page.initAvac = function() {
        var secretType = 'AVAC';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x680800Dd4913021821A9C08D569eF4338dB8E9f6'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '31400000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {
                type: 'input',
                label: 'Network node URL',
                placeholder: 'e.g. https://rinkeby.infura.io',
                network: true
            },
        };
        createSignForm(secretType, 'AVAC_TRANSACTION', fields);

        createSignRawForm(secretType, 'AVAC_RAW', {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some test data'}),
            prefix: {type: 'checkbox', checked: true, label: 'Prefix'},
            hash: {
                type: 'checkbox',
                checked: true,
                label: 'Hash',
                info: 'When prefix is checked, hash will always be set to \'true\''
            }
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });

        createSignEip712(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {
                defaultValue: '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"},{"name":"salt","type":"bytes32"}],"Bid":[{"name":"amount","type":"uint256"},{"name":"bidder","type":"Identity"}],"Identity":[{"name":"userId","type":"uint256"},{"name":"wallet","type":"address"}]},"domain":{"name":"My amazing dApp","version":"2","chainId":1,"verifyingContract":"0x1C56346CD2A2Bf3202F771f50d3D14a367B48070","salt":"0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"},"primaryType":"Bid","message":{"amount":100,"bidder":{"userId":323,"wallet":"0x3333333333333333333333333333333333333333"}}}',
                label: 'Data',
                json: true
            }),
        })

        createExecuteContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'Contract Address', defaultValue: '0xc4375b7de8af5a38a93548eb8453a498222c4ff2'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '0'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            inputs: {
                type: 'textarea',
                label: 'Inputs',
                defaultValue: '[{"type": "address", "value": "0xa7ce868f6490186ac57fa12174df770672ec0950"},{"type": "uint256", "value": "0"}]'
            },
            chainSpecificFields: {
                type: 'textarea',
                label: 'Chain specific fields',
                defaultValue: '{"gasLimit": 145000, "gasPrice": 20000000000}',
                dataName: 'chainSpecific'
            },
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. TestNet', network: true},
            nodeUrl: {
                type: 'input',
                label: 'Network node URL',
                placeholder: 'e.g. https://testnet-avac.arkane.network',
                network: true
            }
        });

        fields.tokenAddress = {
            type: "input",
            label: "Token Address (optional)",
        };
        createExecuteForm(secretType, {
            walletId: fields.walletId,
            to: fields.to,
            value: {type: 'input', label: 'Amount (in AVAC)', defaultValue: '0.0314'},
            tokenAddress: {
                type: 'input',
                label: 'Token address',
                placeholder: 'e.g. 0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570'
            },
            data: fields.data,
            name: fields.name,
            nodeUrl: fields.nodeUrl,
        });
    };


    app.page.initTron = function() {
        var secretType = 'TRON';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'TAwwCCoa6cTjtKJVTSpnKbkDimgALcAXfb'},
            value: {type: 'input', label: 'Amount', defaultValue: '31400'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
        };
        createSignForm(secretType, 'TRON_TRANSACTION', fields);

        createSignRawForm(secretType, 'TRON_RAW', {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some test data'}),
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });


        var executeFields = fields;
        executeFields.value.defaultValue = '0.0314';
        executeFields.tokenAddress = {
            type: "input",
            label: "Token Address (optional)",
        };
        createExecuteForm(secretType, executeFields);

        createExecuteContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'Contract Address', defaultValue: 'TQg6nWj5eVNLNiNF8jk3RyQwbzyuyf2rKg'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '0'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            inputs: {type: 'textarea', label: 'Inputs', defaultValue: '[{"type": "address", "value": "TA311N5Thw4vAjjBLNNtqEZp3qVRpeKgHB"},{"type": "uint256", "value": "0"}]'}
        });
    };

    app.page.initGo = function() {
        var secretType = 'GOCHAIN';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0xd84aeb36b2a30eDB94e9f0A25A82E94e506ebB15'},
            value: {type: 'input', label: 'Amount', defaultValue: '32000000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
        };
        createSignForm(secretType, 'GOCHAIN_TRANSACTION', fields);
        createSignRawForm(secretType, 'GOCHAIN_RAW', {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some test data'}),
        });
        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });

        var executeFields = fields;
        executeFields.value.defaultValue = '0.0321';
        executeFields.tokenAddress = {type: 'input', label: 'Token Address (optional)'};

        createExecuteForm(secretType, executeFields);
    };

    app.page.initVechain = function() {
        var secretType = 'VECHAIN';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x937bBAc40dA751Ff4C72297DD377Cd4da3Ac1AEE', clause: true},
            amount: {type: 'input', label: 'Amount (WEI)', defaultValue: '31400000000000000', clause: true},
            data: {type: 'textarea', label: 'Data (optional)', clause: true, placeholder: ''},
        };
        createSignForm(secretType, 'VECHAIN_TRANSACTION', fields);

        createSignRawForm('VECHAIN', 'VECHAIN_RAW', {
            walletId: {type: 'wallet-select', label: 'From'},
            data: {type: 'textarea', label: 'Message', defaultValue: 'Sign this message to accept our terms.'},
        });

        createExecuteForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x937bBAc40dA751Ff4C72297DD377Cd4da3Ac1AEE'},
            value: {type: 'input', label: 'Amount', defaultValue: '0.0314'},
            tokenAddress: {type: 'input', label: 'Token Address (optional)'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: ''},
        });

        createExecuteContractForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'Contract Address', defaultValue: '0x0000000000000000000000000000456E65726779'},
            value: {type: 'input', label: 'Amount (WEI)', defaultValue: '0'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            inputs: {
                type: 'textarea',
                label: 'Inputs',
                defaultValue: '[{"type": "address", "value": "0xd82049204D8514c637f150C7231BFefC5C4937Ec"},{"type": "uint256", "value": "0"}]'
            }
        });
    };

    app.page.initBitcoin = function() {
        var secretType = 'BITCOIN';
        createSignForm(secretType, 'BITCOIN_TRANSACTION', {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'mikjaeFSKYe6VEC3pQgpYCEwTMYK9Eo5pj'},
            value: {type: 'input', label: 'Amount', defaultValue: '314100'},
        });

        createExecuteForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'mikjaeFSKYe6VEC3pQgpYCEwTMYK9Eo5pj'},
            value: {type: 'input', label: 'Amount (in BTC)', defaultValue: '0.00003141'},
        });
    };

    app.page.initLitecoin = function() {
        var secretType = 'LITECOIN';
        createSignForm(secretType, 'LITECOIN_TRANSACTION', {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'LYFYQfkZ4PXp5waKxSpA9H6xXFhTNPRCPe'},
            value: {type: 'input', label: 'Amount', defaultValue: '314100'},
        });

        createExecuteForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'LYFYQfkZ4PXp5waKxSpA9H6xXFhTNPRCPe'},
            value: {type: 'input', label: 'Amount', defaultValue: '0.00003142'},
        });
    };

    app.page.initNeo = function() {
        var secretType = 'NEO';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'AN2VD52SLntUGFwzZyjzsRqBBkUzjKpKpT'},
            value: {type: 'input', label: 'Amount', defaultValue: '1'},
            data: {type: 'textarea', label: 'Data', defaultValue: 'Sign this message to accept our terms.'},
        };

        createSignForm(secretType, 'NEO_NATIVE_TRANSACTION', fields);

        createExecuteForm(secretType, fields);

        createSignRawForm(secretType, 'NEO_MESSAGE', {
            walletId: fields.walletId,
            data: fields.data,
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });

        createExecuteGasForm(secretType, {
            walletId: fields.walletId,
            to: fields.to,
            value: fields.value,
        });

        createExecuteContractForm(secretType, {
            walletId: fields.walletId,
            to: {type: 'input', label: 'Contract Address', defaultValue: '94a24ee381bc386daa91984c7dd606f6fdd8f19e'},
            functionName: {type: 'input', label: 'Function Name', defaultValue: 'approve'},
            value: {type: 'input', label: 'Amount', defaultValue: '0'},
            inputs: {type: 'textarea', label: 'Inputs', defaultValue: '[{"type": "address", "value": "AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y"},{"type": "integer", "value": "0"}]'},
            chainSpecificFields: {
                type: 'textarea',
                label: 'Chain specific fields',
                defaultValue: '{"networkFee": 0.1, "outputs": [{\"to\":"94a24ee381bc386daa91984c7dd606f6fdd8f19e\",\"amount\":1,\"assetId\":\"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7\"}]}',
                dataName: 'chainSpecific'
            }
        });
    };

    app.page.initAeternity = function() {
        var secretType = 'AETERNITY';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'ak_v3Sj6XxFKodf2VddPHjPdcQHPRsPVkhSLTN9KKrBkx8aFzg1h'},
            value: {type: 'input', label: 'Amount', defaultValue: '14000000000000000000000'},
            data: {
                type: 'textarea',
                label: 'Data',
                defaultValue: 'tx_+IUrAaEBV1+B/7Cil7dyXcZx2gsXabH8XL5FOFx7WtH8Lq8dYJ0LoQXc8QU36IYbbsXk7d7Lg77BPQuicjS136jJKX5wHepi9QOHAZu6brCYAAAAgicQhDuaygCqKxFM1wuWG58AoFFwNxylSmNg4Pv8OlwzrrPdOBQ95X6DOW+5H6nRMbqY3bEntQ==',
                dataName: 'chainSpecific'
            },
        };
        createSignForm(secretType, 'AETERNITY_TRANSACTION', {
            walletId: fields.walletId,
            to: fields.to,
            value: fields.value
        });

        createSignRawForm(secretType, 'AETERNITY_RAW', {
            walletId: fields.walletId,
            data: fields.data,
        });

        createSignMessage(secretType, {
            walletId: fields.walletId,
            data: Object.assign({}, fields.data, {defaultValue: 'Some message', label: 'Message'}),
        });

        createExecuteForm(secretType, {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'ak_v3Sj6XxFKodf2VddPHjPdcQHPRsPVkhSLTN9KKrBkx8aFzg1h'},
            value: {type: 'input', label: 'Amount', defaultValue: '14000'},
        });
    };

    app.page.initHedera = function() {
        var secretType = 'HEDERA';
        var fields = {
            walletId: {type: 'wallet-select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0.0.2278508'},
            amount: {type: 'input', label: 'Amount (in tinybar)', defaultValue: '314000000'},
        };
        createSignForm(secretType, 'HEDERA_HBAR_TRANSFER', fields);

        var tokenAssociationFields = {
            walletId: {type: 'wallet-select', label: 'From'},
            tokenIds: {type: 'input', label: 'tokenIDs (comma separated)'}
        }

        createForm('Execute tokens association', secretType, 'associate-tokens', tokenAssociationFields, executeNativeTransaction, {
            secretType,
            type: 'HEDERA_TOKEN_ASSOCIATION',
        });

        createExecuteForm(secretType, {
            walletId: fields.walletId,
            to: fields.to,
            tokenAddress: {type: "input", label: "Token ID (optional)"},
            value: {type: 'input', label: 'Amount (in HBAR)', defaultValue: '0.0314'},
            chainSpecificFields: {type: 'textarea', label: 'Chain specific fields', defaultValue: '{"transactionMemo": "0.0.2810009"}', dataName: 'chainSpecific'},
        });
    }

    function createFormField(id,
                             label,
                             secretType,
                             field) {
        var htmlGroup = document.createElement('div');
        htmlGroup.className = 'form-group row';
        var htmlLabel = document.createElement('label');
        htmlLabel.htmlFor = id;
        htmlLabel.innerHTML = label;
        htmlLabel.className = 'col-sm-5 col-form-label';
        var htmlFieldCol = document.createElement('div');
        htmlFieldCol.className = 'col-sm-7';

        var htmlField;

        switch (field.type.toLowerCase()) {
            case 'textarea':
                htmlField = document.createElement('textarea');
                htmlField.rows = '4';
                htmlFieldCol.appendChild(htmlField);
                break;
            case 'wallet-select':
                htmlField = document.createElement('select');
                var htmlInputGroup = document.createElement('div');
                htmlInputGroup.className = 'input-group';
                var htmlInputGroupAppend = document.createElement('div');
                htmlInputGroupAppend.className = 'input-group-append';
                var htmlCopyButton = document.createElement('button');
                htmlCopyButton.type = 'button';
                htmlCopyButton.dataset.id = id;
                htmlCopyButton.className = 'btn btn-outline-secondary';
                htmlCopyButton.title = 'Copy';
                htmlCopyButton.addEventListener('click', function(e) {
                    app.copySelectDataAddress('#' + id);
                });
                var htmlCopyIcon = document.createElement('i');
                htmlCopyIcon.className = 'fa fa-copy';
                htmlCopyButton.appendChild(htmlCopyIcon);
                htmlInputGroupAppend.appendChild(htmlCopyButton);
                htmlInputGroup.appendChild(htmlField);
                htmlInputGroup.appendChild(htmlInputGroupAppend);
                htmlFieldCol.appendChild(htmlInputGroup);
                var htmlUnlinkButton = document.createElement('button');
                htmlUnlinkButton.type = 'button';
                htmlUnlinkButton.dataset.id = id;
                htmlUnlinkButton.className = 'btn btn-outline-secondary';
                htmlUnlinkButton.title = 'Unlink';
                htmlUnlinkButton.addEventListener('click', function(e) {
                    unlinkWallet('#' + id, secretType);
                });
                var htmlUnlinkIcon = document.createElement('i');
                htmlUnlinkIcon.className = 'fa fa-unlink';
                htmlUnlinkButton.appendChild(htmlUnlinkIcon);
                htmlInputGroupAppend.appendChild(htmlUnlinkButton);
                break;
            case 'checkbox':
                htmlField = document.createElement('input');
                htmlField.type = 'checkbox';
                if (field.checked) {
                    htmlField.setAttribute('checked', 'checked');
                }
                htmlFieldCol.appendChild(htmlField);
                break;
            case 'secret-type-select':
                var htmlInputGroup = document.createElement('div');
                htmlInputGroup.className = 'input-group';
                htmlField = document.createElement('select');
                for (var index in field.values) {
                    var option = document.createElement('option');
                    option.value = field.values[index];
                    option.text = field.values[index];
                    htmlField.appendChild(option)
                }
                htmlInputGroup.appendChild(htmlField);
                htmlFieldCol.appendChild(htmlInputGroup);
                break;
            default:
                htmlField = document.createElement(field.type);
                htmlFieldCol.appendChild(htmlField);
                break;
        }

        htmlField.className = 'form-control';
        htmlField.name = field.name;
        htmlField.id = id;
        htmlField.placeholder = field.placeholder;
        htmlField.value = field.defaultValue;
        if (field.dataName) {
            htmlField.dataset[field.dataName] = true;
        } else {
            var cleanLabel = label.toLowerCase().split(' ')[0];
            htmlField.dataset[cleanLabel] = true;
        }

        if (field.info) {
            var htmlInfo = document.createElement('small');
            htmlInfo.className = 'form-text text-muted';
            htmlInfo.innerHTML = field.info;
            htmlFieldCol.appendChild(htmlInfo);
        }

        htmlGroup.appendChild(htmlLabel);
        htmlGroup.appendChild(htmlFieldCol);
        return htmlGroup;
    }

    function createHtmlFieldSet(title,
                                prefix,
                                secretType,
                                fields) {
        var fieldSet = document.createElement('fieldset');
        fieldSet.className = 'card-body';
        var htmlLegend = document.createElement('legend');
        htmlLegend.className = 'card-title';
        htmlLegend.innerHTML = title;
        fieldSet.appendChild(htmlLegend);

        var keys = Object.keys(fields);
        for (var keyIndex in keys) {
            var name = keys[keyIndex];
            var fieldId = prefix + '-' + secretType + '-' + name;

            var htmlField = createFormField(fieldId, fields[name].label, secretType, {
                type: fields[name].type,
                name,
                defaultValue: fields[name].defaultValue || '',
                checked: fields[name].checked || false,
                info: fields[name].info || false,
                dataName: fields[name].dataName,
                placeholder: fields[name].placeholder || name,
                values: fields[name].values
            });
            fieldSet.appendChild(htmlField);
        }
        $(fieldSet).append($('<div class="row"><div class="offset-5 col-7"><button type="submit" class="btn btn-primary">Submit</button></div></div>'));
        return fieldSet;
    }

    function addFormSubmitListener(form,
                                   fields,
                                   defaultData,
                                   transactionFunction) {
        var keys = Object.keys(fields);
        form.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('submitting...');
            var data = Object.assign({}, defaultData);
            var clause = {};
            var contractCall = {};
            var network = {};
            for (var keyIndex in keys) {
                var key = keys[keyIndex];
                var name = key;
                var type = fields[name].type;
                var $element = $('[name="' + name + '"]', form);
                var value;

                if (type.toLowerCase() === 'checkbox') {
                    value = $element.length > 0 ? $element.is(':checked') : null;
                } else {
                    value = $element.val() || null;
                }

                if (name === 'hash') {
                    var $prefix = $('[name="prefix"]', form);
                    value = $prefix.length > 0 && $prefix.is(':checked') ? true : value;
                }
                if (name === 'inputs') {
                    value = JSON.parse(value);
                }
                if (name === 'outputs') {
                    value = JSON.parse(value);
                }
                if (name === 'chainSpecificFields') {
                    value = JSON.parse(value);
                }

                if (name === 'data' && fields.data.json) {
                    value = JSON.parse(value);
                }

                if (name === 'tokenIds') {
                    value = value.split(',');
                }

                if (fields[name].clause) {
                    clause[name] = value;
                } else if (fields[name].network) {
                    if (value) {
                        network[name] = value;
                    }
                } else {
                    data[name] = value;
                }
            }
            if (Object.keys(clause).length > 0) {
                data.clauses = [clause];
            }
            if (Object.keys(network).length > 0) {
                data.network = network;
            }
            transactionFunction(data);
        });
    }

    function createForm(title,
                        secretType,
                        formType,
                        fields,
                        transactionFunction,
                        defaultData) {
        var fieldSet = createHtmlFieldSet(title, formType, secretType, fields);
        var formSign = document.querySelector('[data-form="' + formType + '"][data-chain="' + secretType + '"]');
        if (formSign) {
            formSign.appendChild(fieldSet);
            addFormSubmitListener(formSign, fields, defaultData, transactionFunction);
        }
    }

    function createSignForm(secretType,
                            transactionType,
                            fields) {
        createForm('Sign Transaction', secretType, 'sign', fields, sign, {
            type: transactionType,
            submit: false,
        });
    }

    function createSignRawForm(secretType,
                               transactionType,
                               fields) {
        createForm('Sign Raw Data', secretType, 'sign-raw', fields, sign, {
            type: transactionType,
        });
    }

    function createSignMessage(secretType,
                               fields) {
        createForm('Sign Message', secretType, 'sign-message', fields, signMessage, {
            secretType,
        });
    }

    function createSignEip712(secretType,
                              fields) {
        createForm('Sign EIP712', secretType, 'sign-eip712', fields, signEip712, {
            secretType,
        });
    }

    function createExecuteContractForm(secretType,
                                       fields) {
        createForm('Execute contract transaction', secretType, 'execute-contract', fields, executeContract, {
            secretType,
            type: 'CONTRACT_EXECUTION',
        });
    }

    function createReadContractForm(secretType,
                                       fields) {
        createForm('Read contract', secretType, 'read-contract', fields, readContract, {
            secretType,
            type: 'READ_CONTRACT',
        });
    }

    function createExecuteForm(secretType,
                               fields) {
        createForm('Execute Transaction', secretType, 'execute', fields, executeTransaction, {
            secretType,
        });
    }

    function createExecuteGasForm(secretType,
                                  fields) {
        createForm(`Execute gas transfer`, secretType, 'execute-gas', fields, executeGasTransaction, {
            secretType,
            type: 'GAS_TRANSFER',
        });
    }

    function createImportWalletForm(secretType,
                                    fields) {
        createForm(`Export wallet to`, secretType, 'import-wallet', fields, importWallet, {
            secretType
        });
    }

    function unlinkWallet(selector,
                          secretType) {
        var $select = $(selector);
        var value = $select.val();

        window.venlyConnect.api.unlink(value)
              .then(function(result) {
                  return window.venlyConnect.api.getWallets({secretType: secretType})
                               .then(function(wallets) {
                                   wallets = wallets.filter((wallet) => wallet.walletType !== 'APPLICATION');
                                   app.page.updateWallets(wallets, secretType);
                               });
              })
              .catch(function(err) {
                  app.error(err);
              });
    }
})();
