import { Component, Input, Inject } from 'ng-forward';
import ngTable from 'angular-material-data-table';

@Component({
  selector: 'rs-table-pagination',
  controllerAs: 'Pagination',
  providers: [ngTable],
  template: require('./pagination.html'),
  inputs: ['boundaryLinks', 'items', 'page', 'limit', 'total', 'onPaginate']
})

@Inject('$scope')
export default class Pagination {
  @Input() boundaryLinks
  @Input() items;
  @Input() total;
  @Input() onPaginate;
  @Input() query;
  constructor($scope) {
    this.$scope = $scope;
    this.$label = Object.assign({
      page: 'Page:',
      rowsPerPage: 'Rows per page:',
      of: 'of'
    }, this.$scope.$eval(this.$label) || {});
    this.$scope.$watch(::this.getLimit, ::this.evalLimit);
  }


  disableNext() {
    return this.isZero(this.limit) || !this.hasNext();
  }

  evalLimit(newValue, oldValue) {
    if (newValue === oldValue) {
      return;
    }
    // find closest page from previous min
    this.page = Math.floor(((this.page * oldValue - oldValue) + newValue) / (this.isZero(newValue) ? 1 : newValue));
    this.onPaginationChange();
  }

  first() {
    this.page = 1;
    this.onPaginationChange();
  }

  getLimit() {
    return this.limit;
  }

  isPositive(number) {
    return number > 0;
  }

  isZero(number) {
    return number === 0 || number === '0';
  }

  hasNext() {
    return this.page * this.limit < this.total;
  }

  hasPrevious() {
    return this.page > 1;
  }

  last() {
    this.page = this.pages();
    this.onPaginationChange();
  }

  max() {
    return this.hasNext() ? this.page * this.limit : this.total;
  }

  min() {
    return (this.page * this.limit) - this.limit;
  }

  next() {
    this.page += 1;
    this.onPaginationChange();
  }

  pages() {
    return Math.ceil(this.total / (this.isZero(this.limit) ? 1 : this.limit));
  }

  previous() {
    this.page -= 1;
    this.onPaginationChange();
  }

  range(total) {
    return new Array(isFinite(total) && this.isPositive(total) ? total : 1);
  }

  showBoundaryLinks() {
    if (this.boundaryLinks === '') {
      return true;
    }
    return this.boundaryLinks;
  }

  showPageSelect() {
    if (this.pageSelect === '') {
      return true;
    }
    return this.pageSelect;
  }

  onPaginationChange() {
    if (angular.isFunction(this.onPaginate)) {
      this.onPaginate(this.page, this.limit);
    }
  }
}
