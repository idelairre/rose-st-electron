import { remote } from 'electron';

const BrowserWindow = remote.BrowserWindow;
const Menu = remote.Menu;

const menuTmpl = [{
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
}];

const menu = Menu.buildFromTemplate(menuTmpl);
