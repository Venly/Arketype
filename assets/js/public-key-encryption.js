(function() {
    'use strict';

    $(function() {
        $(app).on('authenticated', function() {
            getSigningMethodPublicKeys()
                .then(function(pKeys) {
                    app.page.signingMethodPublicKeys = pKeys;
                    populateSelect(pKeys);
                    bindButtons();
                    if (!app.page.initialised) {
                        app.page.initialised = true;
                    }
                });
        });
    });

    function getSigningMethodPublicKeys() {
        const url = `${app.environment.api}/security`;
        return fetch(url, {
            method: 'GET'
        }).then(r => {
            return r.json();
        })
          .then(r => {
              return r['result']['signingMethod']['publicKeys']
          })
    }


    function populateSelect(pKeys) {
        const select = $('#signing-methods-pk');
        for (let i = 0; i < pKeys.length; i++) {
            // Create an option element
            const option = document.createElement("option");
            const publicKey = pKeys[i];

            // Set the text of the option
            option.text = `${publicKey.keyspec} - ${publicKey.id}`;

            // Set the value of the option (optional)
            option.value = publicKey.key;

            // Append the option to the select element
            select.append(option);
        }
    }

    function createSignature(log) {
        const requestBody = $('#encryption-request-body').val();
        const signature = btoa(String.fromCharCode(...sha256.digest(requestBody)));

        if (log) {
            app.log(signature, 'sha56 signature');
        }
        return signature;
    }

    function createSigningMethod(log) {
        const id = $('#signing-methods-id').val();
        const value = $('#signing-methods-value').val();
        const idempotencyKey = $('#signing-methods-id-key').val();
        const signingMethod = {
            id,
            value,
            idempotencyKey,
            signature: {
                type: 'sha256',
                value: createSignature(false)
            }
        };

        if (log) {
            app.log(signingMethod, 'raw signing-method');
        }
        return signingMethod;
    }

    function encryptUsingSelectedPkey() {
        const encrypt = new JSEncrypt();
        const publicKey = $('#signing-methods-pk').find(":selected").val();
        encrypt.setPublicKey(publicKey);
        const encrypted = encrypt.encrypt(JSON.stringify(createSigningMethod(false)));
        app.log(encrypted, 'encryptedSigningMethod');
    }

    function bindButtons() {
        $('#encryption-request-btn').click(encryptUsingSelectedPkey);
        $('#build-signature-btn').click(() => createSignature(true));
        $('#build-request-btn').click(() => createSigningMethod(true))
    }

})();
