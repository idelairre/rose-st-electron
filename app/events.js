'use strict';

const eventListener = require('ipc');

window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
}, false);

eventListener.on('logout', function() {
  var logout = new Event('logout');
  window.dispatchEvent(logout);
});
eventListener.on('authUrl', function(params) {
  var auth = new Event('auth');
  window.authParams = params;
  window.dispatchEvent(auth);
});
eventListener.on('loaded', function() {
  var loaded = new Event('loaded');
  window.dispatchEvent(loaded);
});
