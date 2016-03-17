import { Component, EventEmitter, Input, Inject } from 'ng-forward';

@Component({
  selector: 'rs-chips-select',
  controllerAs: 'ChipsSelect',
  template: require('./chips-select.html'),
  inputs: ['model', 'placeholder', 'selection', 'selectItems']
})

@Inject('$document', '$element', '$compile', '$scope', '$timeout')
export default class ChipsSelect {
  @Input() model;
  @Input() placeholder;
  @Input() selection;
  @Input() selectItems;
  constructor($document, $element, $compile, $scope, $timeout) {
    this.$compile = $compile;
    this.$document = $document;
    this.$element = $element;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.selectActive = false;
    this.chipInput = {};
    this.chipItems = [];
    this.currentSelectItems = [];
    this.currentSelection = null;

    this.selectValue = {};

    this.style = {
      display: 'inline',
      margin: '0 0 0 0'
    };
    this.$scope.$watch(() => {
      return this.currentSelection;
    }, (current) => {
      if (current !== null) {
        this.currentSelection = null;
      }
    });

    this.$scope.$watch(() => {
      return this.currentSelectItems;
    }, (current, prev) => {
      if (current !== prev) {
        console.log(this.selectItems, this.currentSelectItems);
      }
    });

    console.log($element);
  }

  pushItem(item) {
    if (!this.currentSelectItems.includes(item)) {
      this.currentSelectItems.push(item);
    }
  }

  ngOnInit() {
    let menu = this.$compile(`
      <md-select ng-model="ChipsSelect.currentSelection" ng-change="ChipsSelect.pushItem(ChipsSelect.currentSelection)" aria-label="chip select" ng-style="ChipsSelect.style" placeholder="{{ ChipsSelect.placeholder }}">
        <md-option ng-repeat="item in ChipsSelect.selectItems track by $index" ng-if="!ChipsSelect.currentSelectItems.includes(item)">
          <p>{{ item }}</p>
        </md-option>
      </md-select>`
    )(this.$scope);
    this.$timeout(() => {
      let chipsWrap = this.$element.find('md-chips').find('md-chips-wrap');
      chipsWrap.addClass('md-chips-select-container');
      let inputContainer = chipsWrap.children()[0];
      let input = angular.element(inputContainer).children()[0];
      let selectValue = angular.element(menu).children()[0];
      angular.element(selectValue).css('border-bottom-width', '0px');
      angular.element(input).css('display', 'none');
      this.selectValue = selectValue;
      angular.element(inputContainer).append(menu);
    }, 0);
  }
}