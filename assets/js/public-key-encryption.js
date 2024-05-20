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

    function encryptUsingSelectedPkey() {
        const publicKey = $('#signing-methods-pk').find(":selected").val();
        const dataToEncrypt = `-----BEGIN PUBLIC KEY-----\n${$('#encryption-request-body').val()}\n-----END PUBLIC KEY-----`;
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);
        const encrypted = encrypt.encrypt(dataToEncrypt);

        app.log(encrypted, 'encryptedData');
    }

    function bindButtons() {
        const btnEncrypt = $('#encryption-request-btn');
        btnEncrypt.click(encryptUsingSelectedPkey)
    }

})();
