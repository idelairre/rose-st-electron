import { Component, Inject } from 'ng-forward';
import Chart from './chart/chart.component';
import QueryBuilder from './query-builder/query-builder.component';
import moment from 'moment';
import 'reflect-metadata';

@Component({
	selector: 'analytics',
	controllerAs: 'Analytics',
	template: require('./analytics.html'),
	directives: [Chart, QueryBuilder],
	providers: ['ngMaterial']
})

@Inject('$scope', '$window')
export default class Analytics {
	constructor($scope, $window) {
		let date = new Date();
		let startDate = new Date(date.getFullYear(), 0, 1);
		this.$scope = $scope;
		this.$window = $window;
		this.$window.addEventListener('analyticsReply', ::this.setData);
		this.data = {};
		this.chartState = '';
		this.query = { ids: 'ga:118196120', 'start-date': moment(startDate).format('YYYY-MM-DD'), 'end-date': moment(date).format('YYYY-MM-DD'), metrics: ['ga:users'], dimensions: [], segments: [] };
  }

	postQuery() {
		if (this.query.metrics.length !== 0) {
			let slug = Object.assign({}, this.query);
			slug.dimensions = this.query.dimensions.toString();
			slug.metrics = this.query.metrics.toString();
			let event = new CustomEvent('analyticsRequest', { detail: slug });
			this.$window.dispatchEvent(event);
		}
	}

	setData(event) {
		this.data = event.detail;
		console.log(event.detail);
		this.$scope.$digest();
	}
}
