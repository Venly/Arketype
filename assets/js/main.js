var app = app || {};

app.addAuthEvents = function (authenticated, auth) {
  document.body.classList.add(authenticated ? 'logged-in' : 'not-logged-in');
  $('#auth-username').text(auth.subject);
  $('#auth-token').val(auth.token);
  document.getElementById('auth-loginlink').addEventListener('click', function (e) {
    e.preventDefault();
    auth.login({redirectUri: ''});
  });
  document.getElementById('auth-logout').addEventListener('click', function (e) {
    e.preventDefault();
    auth.logout();
  });
};

app.addConnectEvents = function () {
  document.getElementById('arkane-sign-eth').addEventListener('click', function () {
    //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
    // otherwise the browser might block the popup
    window.arkaneConnect.initPopup();
    //custom logic
    window.arkaneConnect.signTransaction({
      type: 'ETHEREUM_TRANSACTION',
      walletId: $("#sign-select-ETHEREUM").val(),
      submit: false,
      gasPrice: 10000000000,
      gas: 23000,
      nonce: 0,
      value: 10000000000,
      data: '0x',
      to: '0xdc71b72db51e227e65a45004ab2798d31e8934c9'
    }).then(function (result) {
      app.log(result);
    }).catch(function (error) {
      app.log(error);
    });
  });

  document.getElementById('get-wallets').addEventListener('click', function () {
    window.arkaneConnect.getWallets().then(function (e) {
      app.log(e);
      var secretTypes = ["ETHEREUM", "VECHAIN"];
      for (s of secretTypes) {

      }
      $('#sign-select-' + 'ETHEREUM').find('option').remove();
      $('#sign-select-' + 'VECHAIN').find('option').remove();
      for (w of e) {
        $('#sign-select-' + w.secretType).append($('<option>', {
          value: w.id,
          text: w.address
        }));
      }
      $('#sign').show();
    });
  });

  document.getElementById('get-profile').addEventListener('click', function () {
    window.arkaneConnect.getProfile().then(function (e) {
      app.log(e);
    });
  });

  document.getElementById('arkane-sign-vechain').addEventListener('click', function () {
    //if you want to do custom logic between the user pressing a button and signing a transaction, please initialize the popup first as shown below
    // otherwise the browser might block the popup
    window.arkaneConnect.initPopup();
    //custom logic
    window.arkaneConnect.signTransaction({
      type: 'VECHAIN_TRANSACTION',
      walletId: $("#sign-select-VECHAIN").val(),
      submit: false,
      gas: 23000,
      gasPriceCoef: 0,
      clauses: [{
        to: '0xdc71b72db51e227e65a45004ab2798d31e8934c9',
        amount: "10000",
        data: '0x0'
      }]
    }).then(function (result) {
      app.log(result);
    }).catch(function (error) {
      app.log(error);
    });
  });

  document.getElementById('close-popup').addEventListener('click', function () {
    window.arkaneConnect.closePopup();
  });
};

app.initApp = function (authenticated, auth) {
  app.addAuthEvents(authenticated, auth);
};

app.initAuthenticatedApp = function (authenticated, auth) {
  window.arkaneConnect = new ArkaneConnect('ThorBlock', function () {
    return auth.token
  }, 'staging');
  window.arkaneConnect.init('VeChain').then(function () {
    app.addConnectEvents();
    app.getWallets();
  });

};

app.getWallets = function () {
  window.arkaneConnect.getWallets().then(function (result) {
    app.log(result);
  })
};

app.log = function (txt) {
  if (isObject(txt)) {
    txt = JSON.stringify(txt);
  }
  var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  txt = '---' + date + '---\n' + txt;
  $('#appLog').val(function (index, old) {
    return txt + "\n\n" + old;
  });
};

function isObject(obj) {
  return obj === Object(obj);
}
