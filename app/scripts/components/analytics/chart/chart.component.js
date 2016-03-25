import { Component, EventEmitter, Input, Inject, Output } from 'ng-forward';
import ChartTitle from './chart-title/chart-title.component';
import RenderUiName from '../render-ui-name.filter';
import inflected from 'inflected';
import { MONTHS, HOURS, HOURS_APM, DAYS } from '../../../constants/constants';
import 'reflect-metadata';

// NOTE: this is arguably the worst code I've ever written but I was dealing with a bitter depression.

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

let getDates = (startDate, stopDate) => {
	let dateArray = new Array();
	let currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(new Date(currentDate));
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}

@Component({
	selector: 'chart',
	controllerAs: 'Chart',
	template: require('./chart.html'),
	directives: [ChartTitle],
	providers: ['tc.chartjs'],
  inputs: ['state:chartState', 'data', 'fields', 'query'],
  outputs: ['refresh']
})

@Inject('$filter', '$scope', '$window')
export default class Chart {
  @Input() data;
	@Input() fields;
	@Input() query;
  @Output() refresh;
	constructor($filter, $scope, $window) {
		this.$filter = $filter;
		this.$scope = $scope;
    this.$window = $window;

    this.refresh = new EventEmitter();

    this.chartType = 'line';

		this.chartData = {
			datasets: [{
					label: 'dataset 1',
					fillColor: 'rgba(220,220,220,0.2)',
					strokeColor: 'rgba(220,220,220,1)',
					pointColor: 'rgba(220,220,220,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
					data: []
				}]
		};

		this.chartOptions = {
			limit: 100,
			responsive: true,
			maintainAspectRatio: false,
			scaleShowGridLines: true,
			scaleGridLineColor: 'rgba(0,0,0,.05)',
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
		};

    this.doughnutOptions = {
      responsive: true,
      segmentShowStroke : true,
      segmentStrokeColor : '#fff',
      segmentStrokeWidth : 2,
      percentageInnerCutout : 50, // This is 0 for Pie charts
      animationSteps : 100,
      animationEasing : 'easeOutBounce',
      animateRotate : true,
      animateScale : false,
    };

    this.chartValid = true;
    this.queryValid = true;

    this.valid = true;

    this.showChart = true;

    this.$window.addEventListener('analyticsReply', event => {
      console.log(event);
      if (!this.state.comparison) {
        this.dataCache = event.detail;
      }
      this.setData(event.detail);
    });
  }

	ngOnInit() {
		this.chartData.labels = this.generateMonthsLabels();
    this.dataCache = angular.copy(this.data);
	}

	evalData() {
		return this.data;
	}

	generateColor() {
		let getRandomInt = (min, max) => {
  		return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		let r = getRandomInt(0, 255);
		let g = getRandomInt(0, 255);
		let b = getRandomInt(0, 255);
		return `rgb(${r},${g},${b})`;
	}

	generateLabels(data) {
		if (this.query.dimensions.includes('ga:hour')) {
			return this.generateHourLabels();
		} else if (this.query.dimensions.includes('ga:day') || this.query.dimensions.includes('ga:date') ) {
			return this.generateDaysLabels();
		} else if (this.query.dimensions.includes('ga:month')) {
			return this.generateMonthsLabels();
		} else {
      let labels = [];
      console.log(data.rows);
      if (!data.rows) {
        return labels;
      }
      for (let i = 0; data.rows.length > i; i += 1) {
        labels.push(data.rows[i][0]);
      }
      return labels;
    }
	}

	generateHourLabels() {
		let startTime = this.$filter('date')(this.fields['start-date'], 'h:mma');
		let endTime = this.$filter('date')(this.fields['end-date'], 'h:mma');
		startTime = startTime.toLowerCase();
		endTime = endTime.toLowerCase();
		let labels = HOURS_APM.slice(HOURS_APM.indexOf(startTime), HOURS_APM.indexOf(endTime) + 1);
		return labels;
	}

	generateDaysLabels() {
		let datesArray = getDates(this.fields['start-date'], this.fields['end-date']);
		return datesArray.map(date => { return this.$filter('date')(date, 'MMM d')});
	}

	generateMonthsLabels() {
		let startDate = this.$filter('date')(this.fields['start-date'], 'MMMM');
		let endDate = this.$filter('date')(this.fields['end-date'], 'MMMM');
		let labels = MONTHS.slice(MONTHS.indexOf(startDate), MONTHS.indexOf(endDate) + 1);
		return labels;
	}

	initializeFields() {
		let startDate = this.fields['start-date'];
		let endDate = this.fields['end-date'];
		this.fields['start-date'] = new Date(startDate.getFullYear() - 1, startDate.getMonth() - 1, startDate.getDate(), startDate.getHours());
		this.fields['start-date'] = new Date(endDate.getFullYear() - 1, endDate.getMonth() - 1, endDate.getDate(), startDate.getHours());
	}

	normalizeLabels(data) {
    if (typeof this.chartData.labels === 'undefined') {
      return data;
    }
		for (let i = 0; this.chartData.labels.length > i; i += 1) {
			if (typeof data[i] === 'undefined') {
				data[i] = null;
			}
		}
		return data;
	}

	openMenu($mdOpenMenu, event) {
    event.preventDefault();
		$mdOpenMenu(event);
	}

	parseData(data) {
		return data.rows.map(row => {
			return (typeof row[2] !== 'undefined' ? +row[2] : +row[1]);
		});
	}

	parseDoughnutLabels(row) {
		if (typeof row[0] === 'undefined') {
			return;
		}
		let label;
		if (this.query.dimensions.includes('ga:month')) {
			return MONTHS[parseInt(row[1])] || MONTHS[parseInt(row[0]) - 1];
		} else if (this.query.dimensions.includes('ga:week')) {
			label = row[1];
			return `Week ${parseInt(label)}`;
		} else if (this.query.dimensions.includes('ga:day')) {
			label = row[0];
			return this.$filter('date')(this.datesArray[parseInt(label)], 'shortDate');
		} else if (this.query.dimensions.includes('ga:date')) {
			label = row[0].split('');
			let year = parseInt(label.splice(0, 4).join(''));
			let month = parseInt(label.splice(0, 2).join(''));
			let day = parseInt(label.splice(0, 2).join(''));
			let date = new Date(year, month - 1, day);
			return this.$filter('date')(date, 'shortDate');
		} else if (this.query.dimensions.includes('ga:hour')) {
			label = row[0];
			return HOURS[parseInt(label)];
		} else {
      label = row[0];
			return label;
		}
	}

	parseDoughnutValue(row) {
		if (typeof row[0] === 'undefined') {
			return;
		}
		return typeof row[2] !== 'undefined' ? parseInt(row[2]) : parseInt(row[1]);
	}

	parseDoughnutData(data) {
    console.log(data);
		let chartData = [];
		let startDate = this.fields['start-date'];
		let endDate = this.fields['end-date'];
		this.datesArray = getDates(startDate, endDate);
		for (let i = 0; data.rows.length > i; i += 1) {
			chartData.push({
				label: this.parseDoughnutLabels(data.rows[i]),
				value: this.parseDoughnutValue(data.rows[i]),
				color: this.generateColor(),
				highlight: this.generateColor()
			});
		}
		return chartData;
	}

  refreshAction(event) {
    event.preventDefault();
  	this.refresh.next();
  }

	resetState() {
		Object.keys(this.state).map((value, index) => { this.state[value] = false });
	}

  resetChart() {
    this.chartData.datasets.length = 1;
    this.fields.comparison = false;
  }

	setChartState(event, state) {
    event.preventDefault();
    this.resetState();
    console.log(state, this.data);
    this.state[state] = true;
    this.setData(this.data);
    if (state === 'composition') {
      this.chartType = 'doughnut';
    } else if (state === 'comparison') {
      this.chartType = 'bar';
      this.dataCache = angular.copy(this.data);
    } else if (state === 'trends') {
      this.chartType = 'line';
    }
    // this.$scope.$digest();
	}

	setData(response) {
    // this.queryValid = this.validateQuery();
		let data = this.parseData(response);
		if (this.state.comparison && this.fields.comparison) {
      console.log(this.dataCache);
			let data2 = this.parseData(this.dataCache);
			this.chartData = {
				datasets: [{
					label: 'dataset 1',
					fillColor: 'rgba(220,220,220,0.2)',
					strokeColor: 'rgba(220,220,220,1)',
					pointColor: 'rgba(220,220,220,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
					data: []
				}, {
					label: 'dataset 2',
					fillColor: 'rgba(220,220,220,0.2)',
					strokeColor: 'rgba(220,220,220,1)',
					pointColor: 'rgba(220,220,220,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
					data: []
				}]
			};
			this.chartData.labels = this.generateLabels(data);
      console.log(data2, data);
			this.chartData.datasets[0].data = this.normalizeLabels(data2);
			this.chartData.datasets[1].data = this.normalizeLabels(data);
		} else if (this.state.composition) {
			this.resetChart();
			this.doughnutData = this.parseDoughnutData(response);
		} else {
			this.resetChart();
			this.chartData.labels = this.generateLabels(response);
			this.chartData.datasets[0].data = this.normalizeLabels(data);
		}
    this.chartValid = this.validateChart();
    this.valid = this.chartValid && this.queryValid;
	}

  toggleChart() {
    this.showChart = !this.showChart;
  }

  validateChart() {
    let valid = false;
    if (typeof this.chartData.datasets[0].data === 'undefined') {
      return valid;
    }
    let amount;
    if (!this.state.composition) {
      let data1 = this.chartData.datasets[0].data;
      if (data1.length === 0) {
        return valid;
      } else {
        if (typeof this.chartData.datasets[1] !== 'undefined') {
          let data2 = this.chartData.datasets[1].data;
          data1.concat(data2);
        }
        amount = data1.reduce((prev, current) => {
          return prev + current;
        });
        if (amount !== 0) {
          valid = true;
        }
      }
    } else {
      valid = true // TODO: build this out for doughnut chart
    }
    console.log('chart valid? ', valid);
    return valid;
  }

  validateQuery() {
    if (this.query.metrics.length === 0 || this.query.dimensions.length === 0) {
      return false;
    } else {
      return true;
    }
  }
}
