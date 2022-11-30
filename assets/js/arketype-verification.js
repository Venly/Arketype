(function() {
    'use strict';

    $(function() {
        $(app).on('authenticated', function() {
            if (!app.page.initialised) {
                initPerformKYCEvent();
            }
        });
    });

    function initPerformKYCEvent() {
        document.getElementById('perform-kyc').addEventListener('click', function() {
            if (app.getWindowMode() === 'POPUP') {
                window.venlyConnect.flows.performKYC().then((result) => {
                    app.log(result, 'Performing KYC finished');
                }).catch((result) => {
                    app.error(result, 'perform-kyc-error');
                });
            } else {
                window.venlyConnect.flows.performKYC({redirectUri: app.redirectUri});
            }
        });
    }
})();
