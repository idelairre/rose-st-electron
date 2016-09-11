import { Component, EventEmitter, Input, Inject, Output } from 'ng-forward';

@Component({
  selector: 'query-header',
  controllerAs: 'Header',
  template: require('./header.html'),
  providers: ['ngMaterial'],
  inputs: ['chartState', 'fields', 'query', 'state'],
  outputs: ['onChange']
})

@Inject('$compile', '$element')
export default class QueryHeader {
  @Input() fields;
  @Input() query;
  @Output() onChange;
  constructor ($compile, $element) {
    this.$compile = $compile;
    this.$element = $element;

    this.onChange = new EventEmitter();
  }

  setParam(field, param) {
    if (field === 'time' && param === 'start-date' && this.query.dimensions.includes('ga:hour')) {
      this.startTimeCache = angular.copy(this.fields['start-date']);
    } else if (field === 'date' && param === 'start-date' && this.startTimeCache && this.query.dimensions.includes('ga:month')) {
      const date = this.fields['start-date'];
      const time = this.startTimeCache;
      this.fields['start-date'] = new Date(date.getFullYear(), date.getDay(), time.getHours());
    }
    this.onChange.next();
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

  toggleComparison(comparison) {
    this.fields.comparison = comparison;
    if (comparison) {
      const startDate = this.fields['start-date'];
      const endDate = this.fields['end-date'];
      this.prevStartDate = startDate;
      this.prevEndDate = endDate;
      this.fields['start-date'] = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate(), startDate.getHours());
      this.fields['end-date'] = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate(), endDate.getHours());
    } else {
      this.fields['start-date'] = this.prevStartDate;
      this.fields['end-date'] = this.prevEndDate;
    }
    this.onChange.next();
  }
}
