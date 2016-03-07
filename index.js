'use strict';

const electron = require('electron');
const shell = electron.shell;
const path = require('path');
const app = electron.app;
const Menu = require('menu');
const qs = require('qs');

const options = {
	debug: true,
	rootView: 'index.html'
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

	win.loadURL(path.join('file://', __dirname, options.rootView));
	win.on('closed', onClosed);

	win.webContents.on('did-get-redirect-request', (e =>vent, oldUrl, newUrl, isMainFrame) {
		event.preventDefault();
		let params = qs.parse(newUrl);
		for (let key in params) {
			if (key.includes('client_id')) {
				let clientId = params[key];
				delete params[key];
				params.client_id = clientId;
			}
			if (key.includes('uid')) {
				let val = params[key];
				val = val.replace(/#.*/g, ''); // stripout angular shit
				params[key] = val;
			}
		}
		win.webContents.send('authUrl', params);
	});

	win.webContents.on('did-finish-load', () => {
		win.webContents.send('loaded');
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
	let template = [{
		label: 'File',
		submenu: [{
			label: 'Logout',
			click: () => {
				mainWindow.webContents.send('logout');
			}
		}, {
			label: 'Quit',
			accelerator: 'CmdOrCtrl+Z',
			click: () => {
				app.quit();
			}
		}]
	}, {
		label: 'Edit',
		submenu: [{
			label: 'Undo',
			accelerator: 'CmdOrCtrl+Z',
			role: 'undo'
		}, {
			label: 'Redo',
			accelerator: 'Shift+CmdOrCtrl+Z',
			role: 'redo'
		}, {
			type: 'separator'
		}, {
			label: 'Cut',
			accelerator: 'CmdOrCtrl+X',
			role: 'cut'
		}, {
			label: 'Copy',
			accelerator: 'CmdOrCtrl+C',
			role: 'copy'
		}, {
			label: 'Paste',
			accelerator: 'CmdOrCtrl+V',
			role: 'paste'
		}, {
			label: 'Select All',
			accelerator: 'CmdOrCtrl+A',
			role: 'selectall'
		}, ]
	}, {
		label: 'View',
		submenu: [{
			label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
			click: (i =>tem, focusedWindow) {
				if (focusedWindow)
					focusedWindow.reload();
			}
		}, {
			label: 'Toggle Full Screen',
			accelerator: (() => {
				if (process.platform === 'darwin')
					return 'Ctrl+Command+F';
				else
					return 'F11';
			})(),
			click: (i =>tem, focusedWindow) {
				if (focusedWindow)
					focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
			}
		}, {
			label: 'Toggle Developer Tools',
			accelerator: (() => {
				if (process.platform === 'darwin')
					return 'Alt+Command+I';
				else
					return 'Ctrl+Shift+I';
			})(),
			click: (i =>tem, focusedWindow) {
				if (focusedWindow)
					focusedWindow.toggleDevTools();
			}
		}, ]
	}, {
		label: 'Window',
		role: 'window',
		submenu: [{
			label: 'Minimize',
			accelerator: 'CmdOrCtrl+M',
			role: 'minimize'
		}, {
			label: 'Close',
			accelerator: 'CmdOrCtrl+W',
			role: 'close'
		}, ]
	}, {
		label: 'Help',
		role: 'help',
		submenu: [{
			label: 'Learn More',
			click: () => {
				shell.openExternal('http://electron.atom.io');
			}
		}, {
			label: 'Documentation',
			click: () => {
				shell.openExternal(
					`https://github.com/atom/electron/tree/v${process.versions.electron}/docs#readme`
				);
			}
		}, {
			label: 'Community Discussions',
			click: () => {
				shell.openExternal('https://discuss.atom.io/c/electron');
			}
		}, {
			label: 'Search Issues',
			click: () => {
				shell.openExternal('https://github.com/atom/electron/issues');
			}
		}]
	}, ];

	if (process.platform == 'darwin') {
		template.unshift({
			label: 'Electron',
			submenu: [{
				label: 'About Electron',
				role: 'about'
			}, {
				type: 'separator'
			}, {
				label: 'Services',
				role: 'services',
				submenu: []
			}, {
				type: 'separator'
			}, {
				label: 'Hide Electron',
				accelerator: 'Command+H',
				role: 'hide'
			}, {
				label: 'Hide Others',
				accelerator: 'Command+Alt+H',
				role: 'hideothers'
			}, {
				label: 'Show All',
				role: 'unhide'
			}, {
				type: 'separator'
			}, {
				label: 'Quit',
				accelerator: 'Command+Q',
				click: () => {
					app.quit();
				}
			}, ]
		});
		template[3].submenu.push({
			type: 'separator'
		}, {
			label: 'Bring All to Front',
			role: 'front'
		});
	}

	let menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
});
