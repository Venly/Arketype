(function () {
    'use strict';

    $(function () {
        $(app).on('authenticated', function () {
            getPublicKeys().then(function (pKeys) {
                app.page.publicKeys = pKeys;
                populatePublicKeySelect(pKeys);
                bindButtons();
                if (!app.page.privateKeyEncryptionInitialised) {
                    app.page.privateKeyEncryptionInitialised = true;
                }
            });
        });
    });

    function getPublicKeys() {
        const url = `${app.environment.api}/security`;
        return fetch(url, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => data.result.encryptionKeys);
    }

    function populatePublicKeySelect(keys) {
        const select = $('#public-key-select');
        keys.forEach(function (key) {
            const option = document.createElement('option');
            option.value = `${key.id}:${key.publicKey}`;
            option.text = `${key.keyspec} - ${key.id}`;
            select.append(option);
        });
    }

    function base64(buffer) {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    async function generateAESKey() {
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const rawKey = await window.crypto.subtle.exportKey("raw", key);

        $('#aes-key-input').val(base64(rawKey));
        $('#iv-input').val(base64(iv));

        app.log(base64(rawKey), 'AES Key');
        app.log(base64(iv), 'IV Vector');
    }

    async function encryptAESKeyWithRSA() {
        const selected = $('#public-key-select').val();
        if (!selected) {
            alert('Please select a public key.');
            return;
        }

        const [keyId, base64PubKey] = selected.split(':');
        const aesKeyB64 = $('#aes-key-input').val();
        const publicKeyBinary = atob(base64PubKey);
        const publicKeyBuffer = new Uint8Array(publicKeyBinary.length);
        for (let i = 0; i < publicKeyBinary.length; i++) {
            publicKeyBuffer[i] = publicKeyBinary.charCodeAt(i);
        }
        const importedPublicKey = await window.crypto.subtle.importKey(
            "spki",
            publicKeyBuffer,
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            },
            true,
            ["encrypt"]
        );

        const encoder = new TextEncoder();

        const encryptedKey = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            importedPublicKey,
            encoder.encode(aesKeyB64)
        );

        app.log(base64(encryptedKey), 'Encrypted AES Key');
    }

    async function encryptRequestBodyWithAES() {
        const aesKeyB64 = $('#aes-key-input').val();
        const ivB64 = $('#iv-input').val();
        const body = $('#request-body').val();

        if (!aesKeyB64 || !ivB64) {
            alert('AES Key and IV are required.');
            return;
        }

        const aesKeyRaw = Uint8Array.from(atob(aesKeyB64), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const importedAESKey = await window.crypto.subtle.importKey(
            "raw",
            aesKeyRaw,
            {
                name: "AES-GCM"
            },
            true,
            ["encrypt"]
        );

        const encodedBody = new TextEncoder().encode(body);
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            importedAESKey,
            encodedBody
        );

        app.log(base64(encryptedData), 'Encrypted Request Body');
    }

    function bindButtons() {
        $('#generate-aes-btn').click(function () {
            generateAESKey();
        });

        $('#encrypt-key-btn').click(function () {
            encryptAESKeyWithRSA();
        });

        $('#encrypt-data-btn').click(function () {
            encryptRequestBodyWithAES();
        });
    }

})();
