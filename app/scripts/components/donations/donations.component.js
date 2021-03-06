import { Component, Inject, Resolve } from 'ng-forward';
import Donation from './donation.model';
import ModalService from '../../services/modal.service';
import Table, { TableComponent } from '../table/table.component';
import { uniq } from 'lodash';

Date.prototype.addDays = function(days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const getDates = (startDate, stopDate) => {
	const dateArray = new Array();
	let currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(new Date(currentDate));
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}

const TRANSACTION_FIELDS = ['id', 'source', 'amount', 'fee', 'net', 'available_on', 'created_at'];

const CHARGES_FIELDS =  ['id', 'customer', 'amount', 'created_at'];

const CUSTOMER_FIELDS = ['id', 'email', 'subscriptions', 'created_at'];

const SUBSCRIPTION_FIELDS = ['id', 'customer', 'amount', 'created_at'];

@Component({
  selector: 'donations',
  controllerAs: 'Donations',
  template: require('./donations.html'),
  providers: ['tc.chartjs'],
  directives: [Table]
})

@Inject('$filter', '$mdDialog', '$scope', 'transactions', ModalService)
export default class Donations extends TableComponent {
  @Resolve()
  static transactions() {
    return Donation.listTransactions();
  }

  constructor($filter, $mdDialog, $scope, transactions, ModalService) {
    super(ModalService);

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;

    this.options.actions = [];
    this.options.dateType = 'epoche';
    this.options.selectParam = 'id';
    this.options.filterFields = {
      amount: 'currency',
      created_at: 'date',
      available_on: 'date',
      fee: 'currency',
      net: 'currency'
    };

    this.options.transform = {
      currency: (currency) => {
        return currency / 100;
      },
      subscriptions: (subscriptions) => {
        return subscriptions.length
      }
    };

    this.model = Donation;
    this.transactions = transactions;
    this.cachedTransactions = Object.assign([], transactions);

    this.selected = [];

    this.data = {
        labels: [],
        datasets: [{
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(151,187,205,1)',
          data: []
        }]
    };

    const array = Array.apply(null, { length: 11 }).map(Number.call, Number).map(n => n * 10);
    array.splice(0, 1);

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDay());

    // let maxEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDay());

    this.limits = array;

    this.maxStartDate = today;
    // this.maxEndDate = maxEndDate;

    this.chartOptions = {
      limit: 100,
      startDate: lastMonth,
      endDate: today,
      responsive: true,
      maintainAspectRatio: false,
      scaleShowGridLines: true,
      scaleGridLineColor: "rgba(0,0,0,.05)",
      scaleGridLineWidth: 1,
      bezierCurve: true,
      bezierCurveTension: 0.4,
      pointDot: true,
      pointDotRadius: 4,
      pointDotStrokeWidth: 1,
      pointHitDetectionRadius: 20,
      datasetStroke: true,
      datasetStrokeWidth: 2,
      datasetFill: true,
      legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };

    this.state = {
      transactions: true,
      charges: false,
      customers: false,
      subscriptions: false
    };

    this.chartTitle = 'Transactions';

    this.fields = TRANSACTION_FIELDS;

    this.showChart = true;
  }

  evalDates() {
    return [this.chartOptions.startDate, this.chartOptions.endDate];
  }

  evalState(currentState) {
    if (currentState.transactions) {
      this.chartTitle = 'Transactions';
      this.fields = TRANSACTION_FIELDS;
      Donation.listTransactions().then(::this.setTransactions);
    } else if (currentState.charges) {
      this.chartTitle = 'Charges';
      this.fields = CHARGES_FIELDS;
      Donation.listCharges().then(::this.setTransactions);
    } else if (currentState.customers) {
      this.chartTitle = 'Customers';
      this.fields = CUSTOMER_FIELDS;
      Donation.listCustomers().then(::this.setTransactions);
    } else if (currentState.subscriptions) {
      this.chartTitle = 'Subscriptions';
      this.fields = SUBSCRIPTION_FIELDS;
      Donation.listSubscriptions().then(::this.setTransactions);
    }
  }

  resetState() {
    Object.keys(this.state).map((value, index) => { this.state[value] = false });
  }

  setState(state) {
    this.resetState();
    this.state[state] = true;
    this.evalState(this.state);
    this.query.page = 1;
  }

  ngOnInit() {
    this.setTransactions(this.transactions);
  }

  async setTransactions(transactions) {
    this.transactions = transactions;
    this.cachedTransactions = transactions;
    this.total = this.parseTotal(transactions);
    const transactionsCopy = Object.assign([], transactions);

    if (this.state.customers) {
      let { datesArray, data } = this.parseCustomers(transactionsCopy);
      this.data.datasets[0].data = data;
      this.data.labels = datesArray.map(date => { return this.$filter('date')(date, 'shortDate')});
    } else {
      let { datesArray, data } = this.parseCharges(transactionsCopy);
      this.data.datasets[0].data = data;
      this.data.labels = datesArray.map(date => { return this.$filter('date')(date, 'shortDate')});
    }
    setTimeout(() => {
      this.$scope.$digest();
    }, 10);
  }

  openMenu($mdOpenMenu, event) {
    $mdOpenMenu(event);
  }

  initializeDates(transactions, type) {
    const dates = {};
    if (typeof this.chartOptions.startDate === 'undefined') {
      const startDate = Math.min.apply(Math, transactions.map(transaction => {
        return transaction.created_at * 1000;
      }));
      this.chartOptions.startDate = new Date(startDate);
    }
    if (typeof this.chartOptions.endDate === 'undefined') {
      this.chartOptions.endDate = new Date().addDays(1)
    }

    const datesArray = getDates(this.chartOptions.startDate, this.chartOptions.endDate);

    for (let i = 0; datesArray.length > i; i += 1) {
      let date = datesArray[i];
      date = date.toString().split(' ');
      const DATE_KEY = date[1] + date[2] + date[3];
      type === 'transactions' ? dates[DATE_KEY] = [] : dates[DATE_KEY] = 0;
    }
    return { datesArray, dates };
  }

  parseDate(transaction) {
    let date = new Date(parseInt(transaction.created_at * 1000));
    date = date.toString().split(' ');
    return date[1] + date[2] + date[3];
  }

  parseCustomers(customers) {
    let data = [];
    let { datesArray, dates } = this.initializeDates(customers, 'customers');

    let parseCustomerDates = (customers) => {
      for (let i = 0; customers.length > i;) {
        const DATE_KEY = this.parseDate(customers[i]);
        dates[DATE_KEY] === 0 ? dates[DATE_KEY] += 1 : null;
        customers.splice(i, 1);
        if (customers[i + 1]) {
          parseCustomerDates(customers);
        } else {
          break;
        }
      }
    }

    parseCustomerDates(customers);

    for (const key in dates) {
      data.push(dates[key]);
    }
    return { datesArray, data };
  }

  reduceAmounts(data, dates) {
    for (const key in dates) {
      if (dates[key].length !== 0) {
        dates[key] = dates[key].reduce((prev, current) => {
          return prev + current;
        });
      } else {
        dates[key] = 0;
      }
      data.push(dates[key]);
    }
    return data;
  }

  parseCharges(transactions) {
    let data = [];
    const { datesArray, dates } = this.initializeDates(transactions, 'transactions');

    let parseChargeDates = (transactions) => { // i hate math and fuck unix time
      for (let i = 0; transactions.length > i;) {
        const DATE_KEY = this.parseDate(transactions[i]);
        if (dates[DATE_KEY]) {
          dates[DATE_KEY].push(transactions[i].amount / 100);
        }
        transactions.splice(i, 1);
        if (transactions[i + 1]) {
          parseChargeDates(transactions);
        } else {
          break;
        }
      }
    }

    parseChargeDates(transactions);
    data = this.reduceAmounts(data, dates);
    return { datesArray, data };
  }

  parseTotal(transactions) {
    let total = 0;
    let i = 0;
    while (transactions[i]) {
      total += transactions[i].amount / 100;
      i += 1;
    }
    return total;
  }

  async setLimit(limit) {
    if (limit > this.transactions.length) {
      this.transactions = Object.assign([], this.cachedTransactions);
    } else if (limit <= this.transactions.length) {
      this.transactions.length = limit;
    }
    this.setTransactions(this.transactions);
  }

  toggleChart() {
    this.showChart = !this.showChart;
  }
}
