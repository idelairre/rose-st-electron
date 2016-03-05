'use strict';

const electron = require('electron');
const path = require('path');
const app = electron.app;
const Menu = require('menu');
const qs = require('qs');

var parseLocation = function(location) {
	var i, locationSubstring, obj, pair, pairs;
	locationSubstring = location.substring(1);
	obj = {};
	if (locationSubstring) {
		pairs = locationSubstring.split('&');
		pair = void 0;
		i = void 0;
		for (i in pairs) {
			i = i;
			if ((pairs[i] === '') || (typeof pairs[i] === 'function')) {
				continue;
			}
			pair = pairs[i].split('=');
			obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		}
	}
	return obj;
}

let options = {
	"debug": true,
	"root_view": "index.html"
};

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 800,
		height: 640
	});

	win.loadURL(path.join('file://', __dirname, options.root_view));
	win.on('closed', onClosed);

	win.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl, isMainFrame) {
	  event.preventDefault();
		let params = qs.parse(newUrl);
		for (let key in params) {
			if (key.includes('client_id')) {
				let clientId = params[key];
				delete params[key];
				params['client_id'] = clientId;
			}
			if (key.includes('uid')) {
				let val = params[key];
				val = val.replace(/#.*/g, ''); // stripout angular shit
				params[key] = val;
			}
		}
		console.log(params);
		win.webContents.send('authUrl', params);
	});

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
	if (options.debug) {
		mainWindow.openDevTools();
	}
	let menuTmpl = [{
		label: 'File',
		submenu: [{
			label: 'Logout',
			click: function() {
				mainWindow.webContents.send('logout');
			}
		}, {
			label: 'Quit',
			accelerator: 'Command+Q',
			click: function() {
				app.quit();
			}
		}]
	}, {
		label: 'Edit',
		submenu: [{
			label: 'Undo',
			accelerator: 'Command+Z',
			selector: 'undo:'
		}, {
			label: 'Redo',
			accelerator: 'Shift+Command+Z',
			selector: 'redo:'
		}, {
			type: 'separator'
		}, {
			label: 'Cut',
			accelerator: 'Command+X',
			selector: 'cut:'
		}, {
			label: 'Copy',
			accelerator: 'Command+C',
			selector: 'copy:'
		}, {
			label: 'Paste',
			accelerator: 'Command+V',
			selector: 'paste:'
		}, {
			label: 'Select All',
			accelerator: 'Command+A',
			selector: 'selectAll:'
		}]
	}, {
		label: 'View',
		submenu: [{
			label: 'Toggle DevTools',
			accelerator: 'Alt+Command+I',
			click: function() {
				win.toggleDevTools();
			}
		}]
	}];
	let menu = Menu.buildFromTemplate(menuTmpl);
	Menu.setApplicationMenu(menu);
});
