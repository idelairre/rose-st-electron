import 'babel-polyfill';

'use strict';

const electron = require('electron');
const shell = electron.shell;
const path = require('path');
const app = electron.app;
const Menu = require('menu');
const qs = require('qs');
const electronGoogleOauth = require('electron-google-oauth');

const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = '323072685738-k19gtomqj9fp2cqid79lo68rte1q5sco.apps.googleusercontent.com';
const CLIENT_SECRET = 'nbR00wVF5ZOShEcnbBIz6rWJ';
const REDIRECT_URL = 'urn:ietf:wg:oauth:2.0:oob:auto';

const options = {
	debug: (process.env.NODE_ENV === 'production' ? false : true),
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
		} else {
			win.webContents.send('googleRedirect', newUrl);
		}
	});

	win.webContents.on('did-finish-load', () => {
		win.webContents.send('loaded');

		const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

		const scopes = [
			'https://www.googleapis.com/auth/analytics'
		];

		const url = oauth2Client.generateAuthUrl({
			access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
			scope: scopes // If you only need one scope you can pass it as string
		});

		const browserWindowParams = {
			'use-content-size': true,
			center: true,
			show: false,
			resizable: false,
			'always-on-top': true,
			'standard-window': true,
			'auto-hide-menu-bar': true,
			'node-integration': false
		};

		const googleOauth = electronGoogleOauth(browserWindowParams);

		(async () => {

			// retrieve  authorization code only
			const authCode = await googleOauth.getAuthorizationCode(
				['https://www.google.com/m8/feeds'],
				CLIENT_ID,
				CLIENT_SECRET,
				REDIRECT_URL
			);
			console.dir(authCode);

			// retrieve access token and refresh token
			const result = await googleOauth.getAccessToken(
				['https://www.google.com/m8/feeds'],
				CLIENT_ID,
				CLIENT_SECRET,
				REDIRECT_URL
			);
			console.dir(result);

		})();

		win.webContents.send('googleAuth', url);

		const analytics = google.analytics({ version: 'v3', auth: oauth2Client });

		let params = { ids: 'ga:118196120', 'start-date': '30daysAgo', 'end-date': 'yesterday', metrics: 'ga:pageviews' };

		win.webContents.send('google', analytics);

		analytics.data.ga.get(params, (error, response) => {
				if (error) {
					win.webContents.send('google', `${error}`);
				} else {
					win.webContents.send('google', response);
				}
		});
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

	const template = [{
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
		}]
	}, {
		label: 'Tabs',
		submenu: [{
			label: 'Home',
			click: () => {
				mainWindow.webContents.send('goto', 'home');
			}
		}, {
			label: 'Analytics',
			click: () => {
				mainWindow.webContents.send('goto', 'analytics');
			}
		}, {
			label: 'Donations',
			click: () => {
				mainWindow.webContents.send('goto', 'donations');
			}
		}, {
			label: 'Messages',
			click: () => {
				mainWindow.webContents.send('goto', 'messages');
			}
		}, {
			label: 'Posts',
			click: () => {
				mainWindow.webContents.send('goto', 'posts');
			}
		}, {
			label: 'Profile',
			click: () => {
				mainWindow.webContents.send('goto', 'profile');
			}
		}, {
			label: 'Users',
			click: () => {
				mainWindow.webContents.send('goto', 'users');
			}
		}]
	}, {
		label: 'View',
		submenu: [{
			label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
			click: (item, focusedWindow) => {
				focusedWindow ? focusedWindow.reload() : null;
			}
		}, {
			label: 'Toggle Full Screen',
			accelerator: (() => {
				if (process.platform === 'darwin') { return 'Ctrl+Command+F' } else {	return 'F11' }
			})(),
			click: (item, focusedWindow) => {
				focusedWindow ? focusedWindow.setFullScreen(!focusedWindow.isFullScreen()) : null ;
			}
		}, {
			label: 'Toggle Developer Tools',
			accelerator: (() => {
				if (process.platform === 'darwin') { return 'Alt+Command+I' } else { return 'Ctrl+Shift+I' }
			})(),
			click: (item, focusedWindow) => {
				focusedWindow ? focusedWindow.toggleDevTools() : null;
			}
		}]
	}, {
		label: 'Help',
		role: 'help',
		submenu: [{
			label: 'Documentation',
			click: () => {
				shell.openExternal(`https://github.com/atom/electron/tree/v${process.versions.electron}/docs#readme`);
			}
		}, {
			label: 'Search Issues',
			click: () => {
				shell.openExternal('https://github.com/idelairre/rose_st_electron/issues');
			}
		}]
	}];

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
			}]
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
