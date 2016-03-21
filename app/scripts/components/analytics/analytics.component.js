import { Component, Inject } from 'ng-forward';
import Chart from './chart/chart.component';
import QueryBuilder from './query-builder/query-builder.component';
import moment from 'moment';
import 'reflect-metadata';

const DATE = new Date();
const TODAY = [DATE.getFullYear(), DATE.getMonth() + 1, DATE.getDay(), 12];
const YEAR_START = [DATE.getFullYear(), 0, 1, 1];

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

		this.$scope = $scope;
		this.$window = $window;

		this.data = {};

		let startDate = new Date(...YEAR_START);
		let endDate = new Date(...TODAY);

		this.fields = {
			'start-date': startDate,
			'end-date': endDate,
			dimensions: null,
			metrics: null,
			comparison: false
		};

		this.resolved = true;

		this.chartState = '';

		this.query = {
			ids: 'ga:118196120',
			'start-date': startDate,
			'end-date': endDate,
			metrics: ['ga:users'],
			dimensions: ['ga:month', 'ga:nthMonth'],
			segments: []
		};

		this.$window.addEventListener('analyticsReply', event => {
			this.data = event.detail;
			console.log(this.data);
			this.resolved = true;
		});

		this.$window.addEventListener('analyticsError', event => {
			this.resolved = true;
			console.error(event.detail);
		});
	}

	generateSlug(query) {
		let slug = Object.assign({}, query);
		slug.dimensions = query.dimensions.toString();
		slug.metrics = query.metrics.toString();
		slug['start-date'] = moment(this.fields['start-date']).format('YYYY-MM-DD');
		slug['end-date'] = moment(this.fields['end-date']).format('YYYY-MM-DD');
		return slug;
	}

	postQuery(query) {
		console.log(query);
		if (this.resolved && this.query.metrics.length !== 0) {
			this.resolved = false;
			let slug = this.generateSlug(query);
			let event = new CustomEvent('analyticsRequest', {
				detail: slug
			});

			this.$window.dispatchEvent(event);
		}
	}
}
