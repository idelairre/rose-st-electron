import { Component, Input, Inject } from 'ng-forward';
import RenderUiName from '../../render-ui-name.filter';
import inflected from 'inflected';
import { MONTHS } from '../../../../constants/constants';
import 'reflect-metadata';

@Component({
  selector: 'rs-chart-title',
  controllerAs: 'ChartTitle',
  template: require('./chart-title.html'),
  inputs: ['chartState', 'query']
})

@Inject('$filter')
export default class ChartTitle {
  @Input() chartState;
  @Input() query;
  constructor($filter) {
    this.$filter = $filter;
  }

  ngOnInit() {
    this.queryCache = angular.copy(this.query);
  }

  renderMetrics(query) {
    if (!this.validateQuery(query)) {
      query = this.queryCache;
    }
    let items = query.metrics.map(item => {
      return query.metrics.indexOf(item) !== 0 ? ` ${this.renderUiName(item)}` : this.renderUiName(item);
    });
    return items.toString();
  }

  renderUiName(item) {
    return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
  }

  renderDate(query) {
    if (!this.validateQuery(query)) {
      query = this.queryCache;
    }
    this.queryCache = angular.copy(query);
    if (this.chartState === 'composition') {
      let startDate = parseInt(this.$filter('date')(query['start-date'], 'M')) - 1;
      let endDate = parseInt(this.$filter('date')(query['end-date'], 'M')) - 1;
      return `${MONTHS[startDate]} - ${MONTHS[endDate]}`;
    } else if (query.dimensions.includes('ga:date') || query.dimensions.includes('ga:month') || query.dimensions.includes('ga:nthMonth') || query.dimensions.includes('ga:day') || query.dimensions.includes('ga:hour')) {
      let startDate = this.$filter('date')(query['start-date'], 'shortDate');
      let endDate = this.$filter('date')(query['end-date'], 'shortDate');
      return `${startDate} - ${endDate}`;
    } else if (query.dimensions.includes('ga:year')) {
      return this.$filter('date')(query['start-date'], 'yyyy')
    }
  }

  validateQuery(query) {
    if (query.metrics.length === 0 || query.dimensions.length === 0) {
      return false;
    } else {
      return true;
    }
  }
}

// ChartTitle.query.dimensions.includes('ga:day') || ChartTitle.query.dimensions.includes('ga:month') && ChartTitle.query.dimensions.includes('ga:nthMonth') && ChartTitle.chartState !== 'composition''
