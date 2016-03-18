import { Component, EventEmitter, Inject, Input, Output } from 'ng-forward';
import ChipsSelect from './select/chips-select.component';
import inflected from 'inflected';
import moment from 'moment';
import 'reflect-metadata';

// NOTE: divide queries between chart/data types (e.g., composition, trends, comparisons)
// comparison bar charts: make component to make grouped labels
// compositiom doughnut chart: disable grouped labels
// trend line graph: disable grouped labels, enable series

// TODO: find a way to move the bottom border up

// this.timeDimensions = ['ga:date', 'ga:year', 'ga:month', 'ga:week', 'ga:day', 'ga:hour', 'ga:minute', 'ga:nthMonth', 'ga:nthWeek', 'ga:nthDay', 'ga:nthMinute', 'ga:dayOfWeek', 'ga:dayOfWeekName', 'ga:dateHour', 'ga:yearMonth', 'ga:yearWeek', 'ga:isoWeek', 'ga:isoYear', 'ga:isoYearIsoWeek', 'ga:nthHour'];


@Component({
	selector: 'query-builder',
	controllerAs: 'QueryBuilder',
	template: require('./query-builder.html'),
	directives: [ChipsSelect],
  inputs: ['query', 'chartState'],
	outputs: ['onQueryChange']
})

@Inject('$scope')
export default class QueryBuilder {
  @Input() query;
	@Output() onQueryChange
	constructor($scope) {
		this.$scope = $scope;

		this.onQueryChange = new EventEmitter();

		let date = new Date();

		this.startDate = new Date(date.getFullYear(), 0, 1);
		this.endDate = new Date();

		this.fields = {
			'start-date': this.startDate,
			'end-date': this.endDate,
			dimensions: null,
			metrics: null
		};

		this.$scope.$watch(::this.evalStartDate, ::this.setStartDate);

		this.$scope.$watch(::this.evalEndDate, ::this.setEndDate);

		this.$scope.$watchCollection(::this.evalQuery, ::this.setQuery);


		this.state = {
			location: {
				dimensions: ['ga:continent', 'ga:subContinent', 'ga:country', 'ga:region', 'ga:metro', 'ga:city', 'ga:latitude', 'ga:longitude', 'ga:networkDomain', 'ga:networkLocation']
			},
			time: {
				dimensions: ['ga:month', 'ga:nthMonth']
			},
			users: {
				selected: true,
				metrics: ['ga:users', 'ga:newUsers', 'ga:percentNewSessions', 'ga:1dayUsers', 'ga:7dayUsers', 'ga:14dayUsers', 'ga:30dayUsers', 'ga:sessionsPerUser'],
				dimensions: ['ga:userType', 'ga:sessionCount', 'ga:daysSinceLastSession', 'ga:userDefinedValue']
			},
			sessions: {
				selected: false,
				dimensions: ['ga:sessionDurationBucket'],
				metrics: ['ga:sessions', 'ga:bounces', 'ga:bounceRate', 'ga:sessionDuration', 'ga:avgSessionDuration', 'ga:hits']
			},
			traffic: {
				selected: false,
				dimensions: ['ga:referralPath', 'ga:fullReferrer', 'ga:source', 'ga:medium', 'ga:sourceMedium', 'ga:keyword', 'ga:adContent', 'ga:socialNetwork', 'ga:hasSocialNetworkReferral'],
				metrics: ['ga:organicSearches']
			},
			social: {
				selected: false,
				dimensions: ['ga:socialActivityEndorsingUrl', 'ga:socialActivityDisplayName', 'ga:socialActivityPost', 'ga:socialActivityTimestamp', 'ga:socialActivityUserPhotoUrl', 'ga:socialActivityUserProfileUrl', 'ga:socialActivityContentUrl', 'ga:socialActivityTagsSummary', 'ga:socialActivityAction', 'ga:socialActivityNetworkAction'],
				metrics: ['ga:socialActivities']
			},
			dimensions: [],
			metrics: []
		};
		this.state.dimensions = this.state.time.dimensions;
  }

	ngOnInit() {
		this.setState('users');
		this.fields.dimensions = 'time';
		this.fields.metrics = 'users';
		this.state.dimensions = this.state.time.dimensions;
	}

	addParam(field, param) {
		if (!this.query[field].includes(param)) {
			this.query[field].push(param);
		}
	}

	setState(state) {
		this.resetState();
		this.state.current = state;
		this.state[state].selected = true;
		this.state.metrics = this.state[state].metrics;
		this.state.dimensions = this.state[state].dimensions;
		console.log('current state: ', this.state.current);
	}

	evalEndDate() {
		return this.fields['end-date'];
	}

	evalStartDate() {
		return this.fields['start-date'];
	}

	evalQuery() {
		return this.query;
	}

	resetState() {
		Object.keys(this.state).map((value, index) => { this.state[value].selected = false });
	}

	renderUiName(item) {
		return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
	}

	setChartState(state) {
		this.chartState = state;
	}

	setField(field) {
		let category = this.fields[field];
		// let buffer = category.split(' ')[0].toLowerCase();
		this.state[field] = this.state[category][field];
	}

	setEndDate(current, prev) {
		if (current !== prev) {
			this.query['end-date'] = moment(current).format('YYYY-MM-DD');
			if (!this.query.dimensions.includes('ga:nthMonth')) {
				this.query.dimensions.push('ga:nthMonth');
			}
		}
	}

	setStartDate(current, prev) {
		if (current !== prev) {
			this.query['start-date'] = moment(current).subtract(0, 'day').day(0).format('YYYY-MM-DD');
			if (!this.query.dimensions.includes('ga:month')) {
				this.query.dimensions.push('ga:month');
			}
		}
	}

	setQuery(current, prev) {
		if (current !== prev) {
			this.onQueryChange.next();
		}
	}

	openMenu($mdOpenMenu, event	) {
		$mdOpenMenu(event);
	}
}
