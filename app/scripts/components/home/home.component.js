import { Component } from 'ng-forward';
import { VERSION } from '../../constants/constants';
import 'reflect-metadata';

@Component({
	selector: 'home',
	controllerAs: 'Home',
	template: require('./home.html')
})

export default class Home {
	constructor() {
		this.version = VERSION;
		console.log(this.version);
	}
}
