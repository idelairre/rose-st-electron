'use strict';

const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;
const Menu = remote.Menu;

let menuTmpl = [  {
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  },
  {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  },
  {
    type: 'separator'
  },
  {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  },
  {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  },
  {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  },
  {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }];
let menu = Menu.buildFromTemplate(menuTmpl);
