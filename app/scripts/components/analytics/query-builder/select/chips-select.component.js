import { Component, EventEmitter, Input, Inject } from 'ng-forward';

@Component({
  selector: 'rs-chips-select',
  controllerAs: 'ChipsSelect',
  template: require('./chips-select.html'),
  inputs: ['mask', 'model', 'placeholder', 'selection', 'selectItems'],
  outputs: ['onChange']
})

@Inject('$element', '$compile', '$scope')
export default class ChipsSelect {
  @Input() mask;
  @Input() model;
  @Input() placeholder;
  @Input() selection;
  @Input() selectItems;
  @Output() onChange;
  constructor($element, $compile, $scope) {
    this.$compile = $compile;
    this.$element = $element;
    this.$scope = $scope;
    this.selectActive = false;
    this.chipInput = {};
    this.chipItems = angular.copy(this.selectItems);
    this.currentSelectItems = [];
    this.currentSelection = null;

    this.onChange = new EventEmitter();

    this.selectValue = {};

    this.model = this.currentSelectItems;
  }

  ngAfterViewInit() {
    let items = this.selectItems.map(item => {
        return `<md-option><p>${item}</p></md-option>`;
    }).join('');
    let menu = this.$compile(`
      <md-select ng-model="ChipsSelect.currentSelection" ng-change="ChipsSelect.pushItem(ChipsSelect.currentSelection)"	aria-label="chip select" style="display: inline; margin:'0 0 0 0" placeholder="{{ ::ChipsSelect.placeholder }}">
        ${items}
      </md-select>`
    )(this.$scope);
    setTimeout(() => {
      let chipsWrap = this.$element.find('md-chips').find('md-chips-wrap');
      chipsWrap.addClass('md-chips-select-container');
      let inputContainer = chipsWrap.children()[0]; // what the actual fuck angular
      let input = angular.element(inputContainer).children()[0];
      let selectValue = angular.element(menu).children()[0];
      angular.element(selectValue).css('border-bottom-width', '0px');
      angular.element(input).css('display', 'none');
      this.selectValue = selectValue;
      angular.element(inputContainer).append(menu);
      this.currentSelectItems = this.model;
    }, 0);
  }

  evalItems() {
  	return this.currentSelectItems;
  }

  mask(item) {
    // console.log(this.mask);
    return this.mask ? this.mask(item) : item;
  }

  pushItem(item) {
    if (!this.currentSelectItems.includes(item)) {
      this.currentSelection = null;
      this.currentSelectItems.push(item);
      this.onChange.next();
    }
  }
}
