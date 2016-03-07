'use strict';

const eventListener = require('ipc');

window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
}, false);

eventListener.on('logout', function() {
  let logout = new Event('logout');
  window.dispatchEvent(logout);
});
eventListener.on('authUrl', function(params) {
  let auth = new Event('auth');
  window.authParams = params;
  window.dispatchEvent(auth);
});
eventListener.on('loaded', function() {
  let loaded = new Event('loaded');
  window.dispatchEvent(loaded);
});
