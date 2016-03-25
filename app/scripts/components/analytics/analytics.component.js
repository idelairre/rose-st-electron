import { Component, Inject } from 'ng-forward';
import { DATE, TODAY, YEAR_START } from '../../constants/constants';
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
		this.$scope = $scope;
		this.$window = $window;

		this.chartState = { trends: true, composition: false, comparison: false };

		this.data = {};

		let startDate = new Date(...YEAR_START);
		let endDate = new Date(...TODAY);

		this.fields = {
			'start-date': startDate,
			'end-date': endDate
		};

		this.resolved = true;

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

	ngOnInit() {
		setTimeout(() => {
			this.postQuery(this.query);
		}, 0);
	}

	generateSlug(query) {
		let slug = Object.assign({}, query);
		slug['start-date'] = moment(this.fields['start-date']).format('YYYY-MM-DD');
		if (query.dimensions.includes('ga:hour')) {
			slug['end-date'] = slug['start-date'];
		} else {
			slug['end-date'] = moment(this.fields['end-date']).format('YYYY-MM-DD');
		}
		slug.dimensions = query.dimensions.toString();
		slug.metrics = query.metrics.toString();
		return slug;
	}

	postQuery(query) {
		if (this.resolved && this.query.metrics.length !== 0 && this.query.dimensions.length !== 0) {
			this.resolved = false;
			let slug = this.generateSlug(query);
			let event = new CustomEvent('analyticsRequest', {
				detail: slug
			});

			this.$window.dispatchEvent(event);
		}
	}
}
