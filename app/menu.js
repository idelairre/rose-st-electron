'use strict';

const remote = require('electron').remote;
const Menu = remote.Menu;

let menuTmpl = [{
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
}];
let menu = Menu.buildFromTemplate(menuTmpl);
