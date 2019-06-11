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

        app.page.initAeternity();
        app.page.initEthereum();
        app.page.initTron();
        app.page.initGo();
        app.page.initVechain();
        app.page.initBitcoin();
        app.page.initLitecoin();
        app.page.initialised = true;
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
        console.debug('Signing', signData);
        window.arkaneConnect.createSigner().sign(signData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeTransaction(executeData) {
        console.debug('Executing transaction', executeData);
        window.arkaneConnect.createSigner().executeTransaction(executeData)
              .then(function(result) {
                  app.log(result);
              })
              .catch(function(err) {
                  app.error(err);
              });
    }

    function executeNativeTransaction(executeData) {
        console.debug('Executing native transaction', executeData);
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

    app.page.initEthereum = function() {
        var fieldsSign = {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x680800Dd4913021821A9C08D569eF4338dB8E9f6'},
            value: {type: 'input', label: 'Amount (in WEI)', defaultValue: '31400000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
            name: {type: 'input', label: 'Network name', placeholder: 'e.g. Rinkeby', network: true},
            nodeUrl: {type: 'input', label: 'Network node URL', placeholder: 'e.g. https://rinkeby.infura.io', network: true},
        };
        createSignForm('ETHEREUM', 'ETHEREUM_TRANSACTION', fieldsSign);

        createSignRawForm('ETHEREUM', 'ETHEREUM_RAW', {
            walletId: fieldsSign.walletId,
            data: Object.assign({}, fieldsSign.data, { defaultValue: 'Some test data'}),
            prefix: {type: 'checkbox', checked: true, label: 'Prefix'},
            hash: {type: 'checkbox', checked: true, label: 'Hash', info: 'When prefix is checked, hash will always be set to \'true\''}
        });

        var fieldsExecute = fieldsSign;
        fieldsExecute.value.label = 'Amount (in ETH)';
        fieldsExecute.value.defaultValue = '0.0314';
        createExecuteForm('ETHEREUM', fieldsExecute);
    };

    app.page.initTron = function() {
        var signFields = {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'TAwwCCoa6cTjtKJVTSpnKbkDimgALcAXfb'},
            value: {type: 'input', label: 'Amount', defaultValue: '31400'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
        };
        createSignForm('TRON', 'TRON_TRANSACTION', signFields);

        createSignRawForm('TRON', 'TRON_RAW', {
            walletId: signFields.walletId,
            data: Object.assign({}, signFields.data, { defaultValue: 'Some test data'}),
        });


        var executeFields = signFields;
        executeFields.value.defaultValue = '0.0314';
        createExecuteForm('TRON', executeFields);
    };

    app.page.initGo = function() {
        var signFields = {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0xd84aeb36b2a30eDB94e9f0A25A82E94e506ebB15'},
            value: {type: 'input', label: 'Amount', defaultValue: '32000000000000000'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: 'Some test data'},
        };
        createSignForm('GOCHAIN', 'GOCHAIN_TRANSACTION', signFields);
        createSignRawForm('GOCHAIN', 'GOCHAIN_RAW', {
            walletId: signFields.walletId,
            data: Object.assign({}, signFields.data, { defaultValue: 'Some test data'}),
        });

        var executeFields = signFields;
        executeFields.value.defaultValue = '0.0321';
        createExecuteForm('GOCHAIN', executeFields);
    };

    app.page.initVechain = function() {
        createSignForm('VECHAIN', 'VECHAIN_TRANSACTION', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x937bBAc40dA751Ff4C72297DD377Cd4da3Ac1AEE', clause: true},
            amount: {type: 'input', label: 'Amount (GWEI)', defaultValue: '31400000000000000', clause: true},
            data: {type: 'textarea', label: 'Data (optional)', clause: true, placeholder: ''},
        });

        createExecuteForm('VECHAIN', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: '0x937bBAc40dA751Ff4C72297DD377Cd4da3Ac1AEE'},
            value: {type: 'input', label: 'Amount', defaultValue: '0.0314'},
            tokenAddress: {type: 'input', label: 'Token Address (optional)'},
            data: {type: 'textarea', label: 'Data (optional)', placeholder: ''},
        });
    };

    app.page.initBitcoin = function() {
        createSignForm('BITCOIN', 'BITCOIN_TRANSACTION', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'mikjaeFSKYe6VEC3pQgpYCEwTMYK9Eo5pj'},
            value: {type: 'input', label: 'Amount', defaultValue: '314100'},
        });

        createExecuteForm('BITCOIN', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'mikjaeFSKYe6VEC3pQgpYCEwTMYK9Eo5pj'},
            value: {type: 'input', label: 'Amount (in BTC)', defaultValue: '0.00003141'},
        });
    };

    app.page.initLitecoin = function() {
        createSignForm('LITECOIN', 'LITECOIN_TRANSACTION', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'LYFYQfkZ4PXp5waKxSpA9H6xXFhTNPRCPe'},
            value: {type: 'input', label: 'Amount', defaultValue: '314100'},
        });

        createExecuteForm('LITECOIN', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'LYFYQfkZ4PXp5waKxSpA9H6xXFhTNPRCPe'},
            value: {type: 'input', label: 'Amount', defaultValue: '0.00003142'},
        });
    };

    app.page.initAeternity = function() {
        createSignForm('AETERNITY', 'AETERNITY_TRANSACTION', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'ak_v3Sj6XxFKodf2VddPHjPdcQHPRsPVkhSLTN9KKrBkx8aFzg1h'},
            value: {type: 'input', label: 'Amount', defaultValue: '14000'},
        });

        createExecuteForm('AETERNITY', {
            walletId: {type: 'select', label: 'From'},
            to: {type: 'input', label: 'To', defaultValue: 'ak_v3Sj6XxFKodf2VddPHjPdcQHPRsPVkhSLTN9KKrBkx8aFzg1h'},
            value: {type: 'input', label: 'Amount', defaultValue: '14000'},
        });
    };

    function createFormField(id, label, field) {
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
            case 'select':
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
                break;
            case 'checkbox':
                htmlField = document.createElement('input');
                htmlField.type = 'checkbox';
                if (field.checked) {
                    htmlField.setAttribute('checked', 'checked');
                }
                htmlFieldCol.appendChild(htmlField);
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
        if(field.dataName) {
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

    function createHtmlFieldSet(title, prefix, secretType, fields) {
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

            var htmlField = createFormField(fieldId, fields[name].label, {
                type: fields[name].type,
                name,
                defaultValue: fields[name].defaultValue || '',
                checked: fields[name].checked || false,
                info: fields[name].info || false,
                dataName: fields[name].dataName,
                placeholder: fields[name].placeholder || name,
            });
            fieldSet.appendChild(htmlField);
        }
        $(fieldSet).append($('<div class="row"><div class="offset-5 col-7"><button type="submit" class="btn btn-primary">Submit</button></div></div>'));
        return fieldSet;
    }

    function addFormSubmitListener(form, fields, defaultData, transactionFunction) {
        var keys = Object.keys(fields);
        form.addEventListener('submit', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var data = defaultData;
            var clause = {};
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

                if (fields[name].clause) {
                    clause[name] = value;
                } else if (fields[name].network && value) {
                    network[name] = value;
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

    function createForm(title, secretType, formType, fields, transactionFunction, defaultData) {
        var fieldSet = createHtmlFieldSet(title, formType, secretType, fields);
        var formSign = document.querySelector('[data-form="' + formType + '"][data-chain="' + secretType + '"]');
        if (formSign) {
            formSign.appendChild(fieldSet);
            addFormSubmitListener(formSign, fields, defaultData, transactionFunction);
        }
    }

    function createSignForm(secretType, transactionType, fields) {
        createForm('Sign Transaction', secretType, 'sign', fields, sign, {
            type: transactionType,
            submit: false,
        });
    }

    function createSignRawForm(secretType, transactionType, fields) {
        createForm('Sign Raw Transaction', secretType, 'sign-raw', fields, sign, {
            type: transactionType,
        });
    }

    function createExecuteForm(secretType, fields) {
        createForm('Execute Transaction', secretType, 'execute', fields, executeTransaction, {
            secretType,
        });
    }
})();
