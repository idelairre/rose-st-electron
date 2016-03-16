import { Component, Inject } from 'ng-forward';
import Chart from './chart/chart.component';
import QueryBuilder from './query-builder/query-builder.component';
import 'reflect-metadata';

@Component({
	selector: 'analytics',
	controllerAs: 'Analytics',
	template: require('./analytics.html'),
	directives: [Chart, QueryBuilder],
	providers: ['ngMaterial']
})

@Inject('$window')
export default class Analytics {
	constructor($window) {
		this.$window = $window;
		// let params = { ids: 'ga:118196120', 'start-date': '30daysAgo', 'end-date': 'yesterday', metrics: 'ga:pageviews' };
		// let event = new CustomEvent('analyticsRequest', { detail: params });
		// this.$window.dispatchEvent(event);
		this.$window.addEventListener('analyticsReply', event => {
			console.log(event.detail);
		});
		this.query = { ids: 'ga:118196120', 'start-date': '', 'end-date': '', metrics: [], dimensions: [], segments: [] };
  }
}
