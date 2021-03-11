(function () {
    'use strict';

    window.app = window.app || {};
    app.localStorageKeys = app.localStorageKeys || {};
    app.localStorageKeys.windowMode = 'arketype.windowMode';

    app.redirectUri = window.location.href.replace(window.location.search, '');

    app.startLoading = function () {
        document.body.classList.add('async-loading');
    };

    app.stopLoading = function () {
        document.body.classList.remove('async-loading');
    };

    app.copySelectDataAddress = function (selector) {
        var $select = $(selector);
        var value = $select.val();
        var address = $select.find('option[value="' + value + '"]').data('address');
        copyToClipboard(address);
    };

    app.getWindowMode = function () {
        let el = document.getElementById('window-mode');
        if (typeof el !== 'undefined' && el && el.value) {
            return el.value;
        } else {
            return localStorage.getItem(app.localStorageKeys.windowMode) || 'POPUP';
        }
    };

    app.handleWindowModeTypeSwitch = function () {
        var windowModeSelect = document.getElementById('window-mode');
        if (windowModeSelect) {
            var value = windowModeSelect.value;
            if (localStorage) {
                value = localStorage.getItem(app.localStorageKeys.windowMode) || value;
                windowModeSelect.value = value;
            }
        } else {
            value = localStorage.getItem(app.localStorageKeys.windowMode);
        }
        window.arkaneConnect.windowMode = value;
        window.arkaneConnect.signUsing = value;

        if (windowModeSelect) {
            windowModeSelect.addEventListener('change', function (e) {
                window.arkaneConnect.windowMode = e.target.value;
                window.arkaneConnect.signUsing = e.target.value;
                if (localStorage) {
                    localStorage.setItem(app.localStorageKeys.windowMode, e.target.value);
                }
            });
        }
    };

    app.checkResultRequestParams = function () {
        var status = this.getQueryParam('status');
        if (status === 'SUCCESS') {
            app.log({status: status, result: app.extractResultFromQueryParams()});
        } else if (status === 'ABORTED') {
            app.error({status, errors: []});
        } else if (status === 'FAILED') {
            const errorObject = this.extractResultFromQueryParams();
            app.error({status: status, errors: [errorObject.error]});
        }
    };

    app.extractResultFromQueryParams = function () {
        const validResultParams = ['transactionHash', 'signedTransaction', 'r', 's', 'v', 'signature', 'error', 'walletId'];
        const result = {};
        const regex = new RegExp(/[\?|\&]([^=]+)\=([^&]+)/g);
        let requestParam = regex.exec(window.location.href);
        while (requestParam && requestParam !== null) {
            if (validResultParams.includes(requestParam[1])) {
                var asObject = {};
                asObject[decodeURIComponent(requestParam[1])] = decodeURIComponent(requestParam[2]);
                Object.assign(result, asObject);
            }
            requestParam = regex.exec(window.location.href);
        }
        return result;
    };

    function copyToClipboard(text) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }

    function logger(txt,
                    title,
                    type) {
        if (typeof type === 'undefined') {
            type = 'info';
        }
        if (isObject(txt)) {
            txt = JSON.stringify(txt, null, 2);
        }
        var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        var result = '<span class="text-' + type + '">';
        result = result + '[' + date + ']';
        result = result + (title ? ': <strong >' + title + '</strong>' : '');
        result = result + '</span>\n' + txt + '\n\n';
        var $appLog = $('#appLog');
        $appLog.html(result + $appLog.html());
    }

    app.log = function (txt,
                        title) {
        logger(txt, title)
    };

    app.error = function (txt,
                          title) {
        logger(txt, title, 'danger')
    };

    app.clearLog = function () {
        $('#appLog').html('');
    };

    app.getQueryParam = function (name) {
        const url = new URL(window.location.href);
        const params = url.searchParams.getAll(name);
        if (params.length > 0) {
            return params[params.length - 1];
        } else {
            return null;
        }
    };

    function isObject(obj) {
        return obj === Object(obj);
    }

    $(function () {
        app.initApp();
    });

})();
