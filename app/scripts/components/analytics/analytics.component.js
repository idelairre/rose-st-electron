import { Component, Inject } from 'ng-forward';
// import google from 'googleapis';
import 'reflect-metadata';

@Component({
	selector: 'analytics',
	controllerAs: 'Analytics',
	template: require('./analytics.html')
})

@Inject()
export default class Analytics {
	constructor() {
  }
}
