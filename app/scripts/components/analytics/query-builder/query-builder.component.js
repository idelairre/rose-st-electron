import { Component, Inject, Input } from 'ng-forward';
import ChipsSelect from './select/chips-select.component';
import inflected from 'inflected';
import 'reflect-metadata';

// NOTE: divide queries between chart/data types (e.g., composition, trends, comparisons)
// comparison bar charts: make component to make grouped labels
// compositiom doughnut chart: disable grouped labels
// trend line graph: disable grouped labels, enable series

// TODO: find a way to move the bottom border up

@Component({
	selector: 'query-builder',
	controllerAs: 'QueryBuilder',
	template: require('./query-builder.html'),
	directives: [ChipsSelect],
  inputs: ['query']
})

@Inject('$scope')
export default class QueryBuilder {
  @Input() query;
	constructor($scope) {
		this.$scope = $scope;

		let date = new Date();

		this.fields = {
			'start-date': new Date(date.getFullYear(), date.getMonth() - 2, date.getDate()),
			'end-date': new Date()
		};

		this.state = { users: true, sessions: false, traffic: false, social: false };

		this.locationDimensions = ['ga:continent', 'ga:subContinent', 'ga:country', 'ga:region', 'ga:metro', 'ga:city', 'ga:latitude', 'ga:longitude', 'ga:networkDomain', 'ga:networkLocation', 'ga:cityId', 'ga:countryIsoCode', 'ga:regionId', 'ga:regionIsoCode', 'ga:subContinentCode'];
		this.timeDimensions = ['ga:date', 'ga:year', 'ga:month', 'ga:week', 'ga:day', 'ga:hour', 'ga:minute', 'ga:nthMonth', 'ga:nthWeek', 'ga:nthDay', 'ga:nthMinute', 'ga:dayOfWeek', 'ga:dayOfWeekName', 'ga:dateHour', 'ga:yearMonth', 'ga:yearWeek', 'ga:isoWeek', 'ga:isoYear', 'ga:isoYearIsoWeek', 'ga:nthHour'];

    this.users = {
      dimensions: ['ga:userType', 'ga:sessionCount', 'ga:daysSinceLastSession', 'ga:userDefinedValue'],
      metrics: ['ga:users', 'ga:newUsers', 'ga:percentNewSessions', 'ga:1dayUsers', 'ga:7dayUsers', 'ga:14dayUsers', 'ga:30dayUsers', 'ga:sessionsPerUser']
    };

    this.sessions = {
      dimensions: ['ga:sessionDurationBucket'],
      metrics: ['ga:sessions', 'ga:bounces', 'ga:bounceRate', 'ga:sessionDuration', 'ga:avgSessionDuration', 'ga:hits']
    };

    this.traffic = {
      dimensions: ['ga:referralPath', 'ga:fullReferrer', 'ga:source', 'ga:medium', 'ga:sourceMedium', 'ga:keyword', 'ga:adContent', 'ga:socialNetwork', 'ga:hasSocialNetworkReferral'],
      metrics: ['ga:organicSearches']
    };

    this.social = {
      dimensions: ['ga:socialActivityEndorsingUrl', 'ga:socialActivityDisplayName', 'ga:socialActivityPost', 'ga:socialActivityTimestamp', 'ga:socialActivityUserPhotoUrl', 'ga:socialActivityUserProfileUrl', 'ga:socialActivityContentUrl', 'ga:socialActivityTagsSummary', 'ga:socialActivityAction', 'ga:socialActivityNetworkAction'],
      metrics: ['ga:socialActivities']
    };

		this.metrics = this.users.metrics;
		this.dimensions = this.timeDimensions.concat(this.locationDimensions);

		this.$scope.$watch(::this.evalState, ::this.setState);
  }

	addParam(field, param) {
		if (!this.query[field].includes(param)) {
			this.query[field].push(param);
		}
	}

	changeState(state) {
		this.resetState();
		this.state[state] = true;
	}

	evalState() {
		return this.state;
	}

	setState(current, prev) {
		if (current !== prev) {
			console.log(this.state);
			for (let key in this.state) {
				if (this.state[key]) {
					this.resetDimensions();
					this.metrics = this.state[key].metrics;
				}
			}
		}
	}

	resetDimensions() {
		this.dimensions = this.dimensionsCache;
	}

	resetState() {
		Object.keys(this.state).map((value, index) => { this.state[value] = false });
	}

	renderUiName(item) {
		return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
	}

	openMenu($mdOpenMenu, event) {
		$mdOpenMenu(event);
	}
}
