import { Component, EventEmitter, Inject, Input, Output } from 'ng-forward';

@Component({
  selector: 'rs-table-toolbar',
  controllerAs: 'Toolbar',
  template: require('./toolbar.html'),
  inputs: ['options', 'query','selected', 'title'],
  outputs: ['add', 'delete']
})

@Inject('$scope')
export default class Toolbar {
  @Input() query;
  @Input() selected;
  @Input() title;
  @Input() options;
  @Output() add;
  @Output() delete;
  constructor($scope) {
    this.$scope = $scope;
    this.$scope.$watch(::this.evalSelected, ::this.evalState);
    this.state = { actionState: true, searchState: false, itemSelectedState: false };
    this.filter = { options: { updateOn: 'default blur' } };
    this.add = new EventEmitter();
    this.delete = new EventEmitter();
  }

  evalSelected() {
    if (!this.selected) {
      return;
    }
    return this.selected.length;
  }

  evalState(newVal, oldVal) {
    if (newVal !== oldVal) {
      if (this.selected.length) {
        Object.keys(this.state).map((value, index) => { this.state[value] = false });
        this.state.itemSelectedState = true;
      } else if (this.selected.length === 0) {
        this.query && this.query.filter ? this.state.searchState = true : this.state.actionState = false;
        !this.state.searchState ? this.state.actionState = true : null;
        this.state.itemSelectedState = false;
      } else {
        this.state.actionState = true;
      }
      return this.state.itemSelectedState;
    }
  }

  setState() {
    this.state.actionState = !this.state.actionState;
    this.state.searchState = !this.state.searchState;
  }

  addAction() {
    this.add.next();
  }

  deleteAction() {
    this.delete.next();
  }
}
