(function() {
        'use strict';

        $(function() {
            $(app).on('authenticated', function() {
                getSigningMethodPublicKeys()
                    .then(function(pKeys) {
                        app.page.signingMethodPublicKeys = pKeys;
                        populateSelect($('#signing-methods-pk'), pKeys);
                        populateSelect($('#signing-methods-creation-pk'), pKeys);

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
                  return r['result']['encryptionKeys']
              })
        }


        function populateSelect(select,
                                pKeys) {

            for (let i = 0; i < pKeys.length; i++) {
                // Create an option element
                const option = document.createElement("option");
                const publicKey = pKeys[i];

                // Set the text of the option
                option.text = `${publicKey.keyspec} - ${publicKey.id}`;

                // Set the value of the option (optional)
                option.value = `${publicKey.id}:${publicKey.publicKey}`;

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

        function generateRandomAesKey() {
            return window.crypto.subtle.generateKey({
                                                        name: "AES-GCM",
                                                        length: 256,
                                                    },
                                                    true,
                                                    ["encrypt", "decrypt"]);
        }

        async function encryptKeyWithRsa(key,
                                         publicKey) {
            const rsaKey = await importPublicKey(publicKey);
            const exportedRsaKey = await window.crypto.subtle.exportKey("raw", key);
            const encryptedKey = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                    hash: {name: "SHA-256"},
                },
                rsaKey,
                exportedRsaKey
            );
            return arrayBufferToBase64(encryptedKey);
        }

        async function importPublicKey(base64PublicKey) {
            // Decode the base64 string to binary data
            const publicKeyBinary = atob(base64PublicKey);

            // Convert the binary data to ArrayBuffer
            const publicKeyBuffer = new Uint8Array(publicKeyBinary.length);
            for (let i = 0; i < publicKeyBinary.length; i++) {
                publicKeyBuffer[i] = publicKeyBinary.charCodeAt(i);
            }

            // Import the public key from ArrayBuffer
            const publicKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer,
                {
                    name: "RSA-OAEP",
                    hash: {name: "SHA-256"},
                },
                true,
                ["encrypt"]
            );

            return publicKey;
        }


        function encryptSigningMethodWithAes(key,
                                             iv) {
            const encoder = new TextEncoder();
            return window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM", // CTR and CBC modes are also available.
                    iv // The initialization vector.
                },
                key, // The CryptoKey. You can get one with window.crypto.subtle.importKey().
                encoder.encode(JSON.stringify(createSigningMethod(false))));
        }

        async function encryptBodyWithAes(randomAesKey,
                                          iv) {
            const encoder = new TextEncoder();
            return window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM", // CTR and CBC modes are also available.
                    iv // The initialization vector.
                },
                randomAesKey, // The CryptoKey. You can get one with window.crypto.subtle.importKey().
                encoder.encode(JSON.stringify($('#signing-method-creation-body').val())));
        }

        function arrayBufferToBase64(buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }

        async function encryptUsingSelectedPkey() {
            const {id, key} = getSelectedPublicKey();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const randomAesKey = await generateRandomAesKey();
            const encryptedData = await encryptSigningMethodWithAes(randomAesKey, iv);
            const encryptedKey = await encryptKeyWithRsa(randomAesKey, key);
            const encryptedHeader = {
                encryption: {
                    type: 'AES/GCM/NoPadding',
                    iv: arrayBufferToBase64(iv),
                    key: {
                        encryptedValue: encryptedKey,
                        encryptionKeyId: id
                    }
                },
                value: arrayBufferToBase64(encryptedData)
            };
            app.log(btoa(JSON.stringify(encryptedHeader)), 'encryptedSigningMethod');
        }

        function bindButtons() {
            $('#encryption-request-btn').click(() => {
                encryptUsingSelectedPkey().then()
            });
            $('#build-signature-btn').click(() => createSignature(true));
            $('#build-request-btn').click(() => createSigningMethod(true));
            $('#encrypt-creation-request-btn').click(() => {
                encryptSigningMethodCreation().then()
            });
        }

        async function encryptSigningMethodCreation() {
            const {id, key} = getSelectedPublicKey();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const randomAesKey = await generateRandomAesKey();

            const encryptedData = await encryptBodyWithAes(randomAesKey, iv);
            const encryptedKey = await encryptKeyWithRsa(randomAesKey, key);
            const encryptedHeader = {
                encryption: {
                    type: 'AES/GCM/NoPadding',
                    iv: arrayBufferToBase64(iv),
                    key: {
                        encryptedValue: encryptedKey,
                        encryptionKeyId: id
                    }
                },
                value: arrayBufferToBase64(encryptedData)
            };
            app.log(JSON.stringify(encryptedHeader), 'encryptedSigningMethod');
        }

        function getSelectedPublicKey() {
            const publicKey = $('#signing-methods-pk').find(":selected").val();

            const [id, key] = publicKey.split(':');

            return {
                id,
                key
            };
        }
    }

)
();
