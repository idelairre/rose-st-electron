import { Component, Input, Inject } from 'ng-forward';
import RenderUiName from '../../render-ui-name.filter';
import inflected from 'inflected';
import 'reflect-metadata';

@Component({
  selector: 'rs-chart-title',
  controllerAs: 'ChartTitle',
  template: require('./chart-title.html'),
  pipes: [RenderUiName],
  inputs: ['query']
})

export default class ChartTitle {
  @Input() query;
  constructor() { }

  renderUiName(item) {
    return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
  }
}
