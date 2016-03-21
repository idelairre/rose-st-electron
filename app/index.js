import electron, { app, ipcMain, shell } from 'electron';
import google from 'googleapis';
import Menu from 'menu';
import path from 'path';
import qs from 'qs';
import 'babel-polyfill'

process.env.GOOGLE_APPLICATION_CREDENTIALS = `${__dirname}/credentials.json`;
process.env.NODE_ENV = require('./package.json').environment;

const options = {
	debug: (process.env.NODE_ENV === 'production' ? false : true),
	rootView: 'index.html'
};

if (process.env.NODE_ENV !== 'production') {
	require('electron-debug')();
	require('crash-reporter').start();
}

console.log('environment: ', process.env.NODE_ENV);

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function analyticsRequest(params, callback) {
	google.auth.getApplicationDefault((err, authClient) => {
		if (err) {
			console.error(err);
			return;
		}

		if (authClient.createScopedRequired && authClient.createScopedRequired()) {
			// Scopes can be specified either as an array or as a single, space-delimited string.
			authClient = authClient.createScoped(['https://www.googleapis.com/auth/analytics']);
		}

		const analytics = google.analytics({ version: 'v3', auth: authClient });

		analytics.data.ga.get(params, (error, response) => {
			if (error) {
				console.error(`${error}`);
				return callback ? callback(error) : error;
			} else {
				console.log(response);
				return callback(null, response) || response;
			}
		});
	});
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 800,
		height: 640
	});

	win.loadURL(path.join('file://', __dirname, options.rootView));
	win.on('closed', onClosed);

	win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl, isMainFrame) => {
		event.preventDefault();
		let params = qs.parse(newUrl);
		if (params.hasOwnProperty('client_id') && params.hasOwnProperty('uid')) { // if it has a client id, its a request to heroku. if not, its to google
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
		}
	});

	win.webContents.on('did-finish-load', () => {
		win.webContents.send('loaded');
	});

	return win;
}

ipcMain.on('analyticsParams', (event, args) => {
	console.log(args);
	analyticsRequest(args, (error, response) => {
		if (error !== null) {
			event.sender.send('ipcAnalyticsError', error);
			return;
		}
		console.log(response);
  	event.sender.send('ipcAnalyticsReply', response);
	});
});

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

	function goto(location) {
		console.log(location);
		mainWindow.webContents.send('goto', location);
	}

	function fullscreenAcc() {
		if (process.platform === 'darwin') {
			return 'Ctrl+Command+F';
		} else {
			return 'F11';
		}
	}

	function devToolsAcc() {
		if (process.platform === 'darwin') {
			return 'Alt+Command+I';
		} else {
			return 'Ctrl+Shift+I';
		}
	}

	function setFullScreen(focusedWindow) {
		focusedWindow ? focusedWindow.setFullScreen(!focusedWindow.isFullScreen()) : null
	}

	function toggleDevTools(focusedWindow) {
		focusedWindow ? focusedWindow.toggleDevTools() : null;
	}

	const README_LINK = `https://github.com/atom/electron/tree/v${process.versions.electron}/docs#readme`;
	const ISSUES_LINK = 'https://github.com/idelairre/rose_st_electron/issues';

	const template = [{
		label: 'File',
		submenu: [
			{ label: 'Logout', click: () => { mainWindow.webContents.send('logout') } },
			{ label: 'Quit', accelerator: 'CmdOrCtrl+Z', click: () => { app.quit() } }
		]
	}, {
		label: 'Edit',
		submenu: [
			{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
			{ label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
			{ type: 'separator' },
			{ label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
			{ label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
			{ label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste'},
			{ label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall'}
		]
	}, {
		label: 'Tabs',
		submenu: [
			{ label: 'Home', click: () => { goto('home') } },
			{ label: 'Analytics', click: () => { goto('analytics') } },
			{ label: 'Donations', click: () => { goto('donations') } },
			{ label: 'Messages', click: () => { goto('messages') } },
			{ label: 'Posts', click: () => { goto('posts') } },
			{ label: 'Profile', click: () => { goto('profile') } },
			{ label: 'Users', click: () => { goto('users') } }
		]
	}, {
		label: 'View',
		submenu: [
			{ label: 'Reload', accelerator: 'CmdOrCtrl+R', click: (item, focusedWindow) => { focusedWindow ? focusedWindow.reload() : null } },
			{ label: 'Toggle Full Screen', accelerator: (() => { return fullscreenAcc() })(), click: (item, focusedWindow) => { setFullScreen(focusedWindow) } },
			{ label: 'Toggle Developer Tools', accelerator: (() => { return devToolsAcc() })(), click: (item, focusedWindow) => { toggleDevTools(focusedWindow) } }
		]
	}, {
		label: 'Help',
		role: 'help',
		submenu: [
			{ label: 'Documentation', click: () => { shell.openExternal(README_LINK) } },
			{ label: 'Search Issues', click: () => { shell.openExternal(ISSUES_LINK) } }
		]
	}];

	if (process.platform == 'darwin') {
		template.unshift({
			label: 'Electron',
			submenu: [
				{ label: 'About Electron', role: 'about' },
				{ type: 'separator' },
				{ label: 'Services', role: 'services', submenu: [] },
				{ type: 'separator' },
				{ label: 'Hide Electron', accelerator: 'Command+H', role: 'hide' },
				{ label: 'Hide Others', accelerator: 'Command+Alt+H', role: 'hideothers' },
				{ label: 'Show All', role: 'unhide' },
				{ type: 'separator' },
				{ label: 'Quit', accelerator: 'Command+Q', click: () => { app.quit() } }
			]
		});
		template[3].submenu.push({ type: 'separator' }, { label: 'Bring All to Front', role: 'front' });
	}

	let menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
});
