import { ipcRenderer, remote, shell } from 'electron';

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
}, false);

window.addEventListener('openBrowser', event => {
  shell.openExternal(event.detail);
});

ipcRenderer.on('loaded', () => {
  let event = new Event('loaded');
  window.dispatchEvent(event);
});


ipcRenderer.on('goto', (e, args) => {
  let event = new CustomEvent('goto', { detail: args });
  window.dispatchEvent(event);
});

// authentication events

ipcRenderer.on('logout', () => {
  let event = new Event('logout');
  window.dispatchEvent(event);
});

ipcRenderer.on('authUrl', (e, args) => {
  let event = new CustomEvent('auth', { detail: args });
  window.dispatchEvent(event);
});

window.addEventListener('authenticated', (e) => {
  ipcRenderer.send('authenticated', e.detail);
});


// analytics events

window.addEventListener('analyticsRequest', (e) => {
  ipcRenderer.send('analyticsParams', e.detail);
});

ipcRenderer.on('ipcAnalyticsReply', (e, args) => {
  let event = new CustomEvent('analyticsReply', { detail: args });
  window.dispatchEvent(event);
});

ipcRenderer.on('ipcAnalyticsError', (e, args) => {
  let event = new CustomEvent('analyticsError', { detail: args });
  window.dispatchEvent(event);
});
