import { Component, EventEmitter, Inject, Input, Output } from 'ng-forward';
import ngTable from 'angular-material-data-table';

const inflect = require('inflected');

@Component({
  selector: 'rs-table-container',
  controllerAs: 'Table',
  providers: [ngTable],
  template: require('./table-container.html'),
  inputs: ['fields', 'items', 'options', 'selected', 'query', 'model'],
  outputs: ['delete', 'edit', 'preview']
})

@Inject('$compile', '$filter', '$scope')
export default class TableContainer {
  @Input() fields;
  @Input() items;
  @Input() options;
  @Input() selected;
  @Input() query;
  @Input() model;
  @Output() delete;
  @Output() edit;
  @Output() preview;
  constructor($compile, $filter, $scope) {
    this.$compile = $compile;
    this.$filter = $filter;
    this.$scope = $scope;
    this.delete = new EventEmitter();
    this.edit = new EventEmitter();
    this.preview = new EventEmitter();
  }

  pushSelected(item) {
    if (!this.selected.includes(item[this.options.selectParam])) {
      this.selected.push(item[this.options.selectParam]);
    } else {
      this.selected.splice(this.selected.indexOf(item[this.options.selectParam]), 1);
    }
  }

  format(item, key) {
    return this.formatType(item[key], key);
  }

  formatField(field) {
    return inflect.humanize(field);
  }

  formatType(value, field) {
    if (Array.isArray(value)) {
      return value.length;
    } else if (typeof this.options.filterFields !== 'undefined' && this.options.filterFields.hasOwnProperty(field) && this.options.filterFields[field] === 'date') {
      return this.parseDate(value);
    } else if (typeof this.options.filterFields !== 'undefined' && this.options.filterFields.hasOwnProperty(field) && this.options.filterFields[field] === 'currency') {
      return this.parseCurrency(value);
    } else {
      return value;
    }
  }

  setSelected(item) {
    this.selected.length = 0;
    this.selected.push(item[this.options.selectParam]);
  }

  parseCurrency(value) {
    if (this.options.transform.currency) {
      return this.$filter('currency')(this.options.transform.currency(value));
    } else {
      return this.$filter('currency')(value);
    }
  }

  parseDate(value) {
    if (this.options.dateType === 'epoche') {
      return this.$filter('date')(value * 1000, 'MM.dd.yyyy h:mm a');
    } else {
      return this.$filter('date')(value, 'MM.dd.yyyy h:mm a');
    }
  }

  previewAction(event, item) {
    this.setSelected(item);
    this.preview.next(event, item);
  }

  deleteAction(event, item) {
    this.setSelected(item);
    this.delete.next(event, item);
  }

  editAction(event, item) {
    this.setSelected(item);
    this.edit.next(event, item);
  }

  orderByAction(event, field) {
    this.query.order = field;
  }
}
