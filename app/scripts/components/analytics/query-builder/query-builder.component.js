import { Component, EventEmitter, Inject, Input, Output } from 'ng-forward';
import ChipsSelect from './select/chips-select.component';
import Inflector from './inflector.filter';
import inflected from 'inflected';
import moment from 'moment';
import 'reflect-metadata';

// NOTE: divide queries between chart/data types (e.g., composition, trends, comparisons)
// comparison bar charts: make component to make grouped labels
// compositiom doughnut chart: disable grouped labels
// trend line graph: disable grouped labels, enable series

// TODO: the following dimensions: ['ga:week', 'ga:nthWeek', 'ga:dayOfWeek', 'ga:dayOfWeekName', 'ga:dateHour', 'ga:yearMonth', 'ga:yearWeek']

const DATE_FORMAT = 'YYYY-MM-DD';

@Component({
	selector: 'query-builder',
	controllerAs: 'QueryBuilder',
	template: require('./query-builder.html'),
	directives: [ChipsSelect],
	pipes: [Inflector],
  inputs: ['fields', 'query', 'chartState'],
	outputs: ['onQueryChange']
})

@Inject('$scope')
export default class QueryBuilder {
	@Input() fields;
  @Input() query;
	@Output() onQueryChange
	constructor($scope) {
		this.$scope = $scope;

		this.onQueryChange = new EventEmitter();

		this.state = {
			location: {
				dimensions: ['ga:continent', 'ga:subContinent', 'ga:country', 'ga:region', 'ga:metro', 'ga:city', 'ga:latitude', 'ga:longitude', 'ga:networkDomain', 'ga:networkLocation']
			},
			time: {
				dimensions: ['ga:date', 'ga:year', 'ga:month', 'ga:day', 'ga:hour', 'ga:nthMonth', 'ga:nthDay', 'ga:nthHour']
			},
			users: {
				selected: false,
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

		this.$scope.$watchCollection(::this.evalQuery, ::this.setQuery);

  }

	ngOnInit() {
		this.setState('users');
		this.startDate = angular.copy(this.fields['start-date']);
		this.endDate = angular.copy(new Date());
		this.fields.dimensions = 'time';
		this.fields.metrics = 'users';
	}

	evalQuery() {
		return this.query;
	}

	toggleComparison(comparison) {
		if (comparison) {
			let startDate = this.fields['start-date'];
			let endDate = this.fields['end-date'];
			this.prevStartDate = startDate;
			this.prevEndDate = endDate;
			this.fields['start-date'] = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate(), startDate.getHours());
			this.fields['end-date'] = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate(), endDate.getHours());
		} else {
			this.fields['start-date'] = this.prevStartDate;
			this.fields['end-date'] = this.prevEndDate;
		}
		this.onQueryChange.next();
	}

	setParam(field, param) {
		if (field === 'time' && param === 'start-date' && this.query.dimensions.includes('ga:hour')) {
			this.startTimeCache = angular.copy(this.fields['start-date']);
		} else if (field === 'date' && param === 'start-date' && this.startTimeCache && this.query.dimensions.includes('ga:month')) {
			let date = this.fields['start-date'];
			let time = this.startTimeCache;
			this.fields['start-date'] = new Date(date.getFullYear(), date.getDay(), time.getHours());
		}
		this.onQueryChange.next();
	}

	setState(state) {
		this.resetState();
		this.state.current = state;
		this.state[state].selected = true;
		this.state.metrics = this.state[state].metrics;
		this.state.dimensions = this.state[state].dimensions;
	}

	renderUiName(item) {
		return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
	}

	resetState() {
		Object.keys(this.state).map((value, index) => {
			if (typeof this.state[value].selected !== 'undefined') {
				this.state[value].selected = false;
			}
		});
	}

	setChartState(state) {
		this.chartState = state;
	}

	setField(field) {
		let category = this.fields[field];
		this.state[field] = this.state[category][field];
	}

	setQuery(current, prev) {
		if (current !== prev) {
			this.onQueryChange.next();
		}
	}

	showDatePicker1() {
		return this.query.dimensions.includes('ga:month') ||
		this.query.dimensions.includes('ga:week') ||
		this.query.dimensions.includes('ga:day') ||
		this.query.dimensions.includes('ga:date') ||
		this.query.dimensions.includes('ga:hour');
	}

	showDatePicker2() {
		return this.query.dimensions.includes('ga:month') && this.chartState !== 'composition' ||
		this.query.dimensions.includes('ga:week') && this.query.dimensions.includes('ga:nthWeek') ||
		this.query.dimensions.includes('ga:day') || this.query.dimensions.includes('ga:date');
	}

	openMenu($mdOpenMenu, event	) {
		$mdOpenMenu(event);
	}
}
