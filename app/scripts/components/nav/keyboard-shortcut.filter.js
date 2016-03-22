import { Pipe, Inject } from 'ng-forward';

@Pipe
@Inject('$window')
export default class KeyboardShortcut {
	constructor($window) {
		this.$window = $window;
	}

	transform(str) {
		if (!str) {
			return;
		}
		let keys = str.split('-');
		let isOSX = /Mac OS X/.test(this.$window.navigator.userAgent);
		let seperator = (!isOSX || keys.length > 2) ? '+' : '';
		let abbreviations = {
			M: isOSX ? '⌘' : 'Ctrl',
			A: isOSX ? 'Option' : 'Alt',
			S: 'Shift'
		};
		return keys.map((key, index) => {
			let last = index == keys.length - 1;
			return last ? key : abbreviations[key];
		}).join(seperator);
	}
}
