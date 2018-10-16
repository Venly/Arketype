/* global Keycloak, console */

var app = app || {};
app.auth = Keycloak("arkane.json");
app.auth.init({
  onLoad: 'check-sso'
}).then(function (authenticated) {
  app.initApp(authenticated, app.auth);
  if (authenticated) {
    app.initAuthenticatedApp(authenticated, app.auth);
  }
}).catch(function (e) {
  console.error('Authentication failed');
});

