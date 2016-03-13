'use strict';

const eventListener = require('node-ipc');
const shell = require('electron').shell;

window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
}, false);

window.addEventListener('openBrowser', function (e) {
  console.log(e.detail);
  shell.openExternal(e.detail);
});

eventListener.on('goto', function(params) {
  let goto = new CustomEvent('goto', { detail: params });
  window.dispatchEvent(goto);
});

eventListener.on('logout', function() {
  let logout = new Event('logout');
  window.dispatchEvent(logout);
});

eventListener.on('authUrl', function(params) {
  let auth = new CustomEvent('auth', { detail: params });
  window.dispatchEvent(auth);
});

eventListener.on('loaded', function() {
  let loaded = new Event('loaded');
  window.dispatchEvent(loaded);
});

eventListener.on('googleAuth', function(params) {
  let googleAuth = new CustomEvent('googleAuth', { detail: params });
  window.dispatchEvent(googleAuth);
});

eventListener.on('googleRedirect', function(params) {
  let googleAuth = new CustomEvent('googleRedirect', { detail: params });
  window.dispatchEvent(googleAuth);
});

eventListener.on('google', function(params) {
  let google = new CustomEvent('google', { detail: params });
  window.dispatchEvent(google);
});
