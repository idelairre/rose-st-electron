import { Component, Input, Inject } from 'ng-forward';
import RenderUiName from '../../render-ui-name.filter';
import inflected from 'inflected';
import { MONTHS } from '../../../../constants/constants';
import 'reflect-metadata';

@Component({
  selector: 'rs-chart-title',
  controllerAs: 'ChartTitle',
  template: require('./chart-title.html'),
  pipes: [RenderUiName],
  inputs: ['fields', 'query']
})

@Inject('$filter')
export default class ChartTitle {
  @Input() query;
  constructor($filter) {
    this.$filter = $filter;
  }

  renderUiName(item) {
    return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
  }

  renderMonth(date) {
    // console.log(date, parseInt(this.$filter('date')(date, 'M')), MONTHS[parseInt(this.$filter('date')(date, 'M'))]);
    return MONTHS[parseInt(this.$filter('date')(date, 'M')) - 1];
  }
}
