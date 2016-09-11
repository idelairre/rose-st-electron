import { Component, Inject, Resolve } from 'ng-forward';
import { DATE, TODAY, YEAR_START } from '../../constants/constants';
import AnalyticsService from '../../services/analytics.service';
import Chart from './chart/chart.component';
import ModalService from '../../services/modal.service';
import QueryBuilder from './query-builder/query-builder.component';
import moment from 'moment';
import 'reflect-metadata';

const startDate = new Date(...YEAR_START);
const endDate = new Date(...TODAY);

@Component({
	selector: 'analytics',
	controllerAs: 'Analytics',
	template: require('./analytics.html'),
	directives: [Chart, QueryBuilder],
	providers: ['ngMaterial']
})

@Inject('$scope', '$window', 'data', AnalyticsService, ModalService)
export default class Analytics {
	@Resolve()
	@Inject(AnalyticsService)
	static data(AnalyticsService) {
		return AnalyticsService.request({
			ids: 'ga:118196120',
			'start-date': moment(startDate).format('YYYY-MM-DD'),
			'end-date': moment(endDate).format('YYYY-MM-DD'),
			metrics: ['ga:users'],
			dimensions: ['ga:month', 'ga:nthMonth'],
			segments: []
		});
	}

	constructor($scope, $window, data, AnalyticsService, ModalService) {
		this.$scope = $scope;
		this.$window = $window;

		this.analyticsService = AnalyticsService;

		this.modalService = ModalService;

		this.chartState = {
			trends: true,
			composition: false,
			comparison: false
		};

		this.data = data;

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
	}

	generateSlug(query) {
		const slug = Object.assign({}, query);
		slug['start-date'] = moment(this.fields['start-date']).format('YYYY-MM-DD');
		if (query.dimensions.includes('ga:hour')) {
			slug['end-date'] = slug['start-date'];
		} else {
			slug['end-date'] = moment(this.fields['end-date']).format('YYYY-MM-DD');
		}
		slug.dimensions = query.dimensions.toString().trim();
		slug.metrics = query.metrics.toString().trim();
		return slug;
	}

	async postQuery(query) {
		try {
			if (this.resolved && this.query.metrics.length !== 0 && this.query.dimensions.length !== 0) {
				this.resolved = false;
				const slug = this.generateSlug(query);
				const response = await this.analyticsService.request(slug);
				Object.assign(this.data, response);
			}
		} catch (err) {
			this.modalService.error(err.errors[0].message.trim());
		}
	}
}
