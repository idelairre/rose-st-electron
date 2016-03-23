import { Component, Input, Inject } from 'ng-forward';
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
	pipes: [RenderUiName],
	directives: [ChartTitle],
	providers: ['tc.chartjs'],
  inputs: ['chartState', 'data', 'fields', 'query']
})

@Inject('$filter', '$scope')
export default class Chart {
	@Input() chartState;
  @Input() data;
	@Input() fields;
	@Input() query;
	constructor($filter, $scope) {
		this.$filter = $filter;
		this.$scope = $scope;

		this.state = { trends: true, composition: false, comparison: false };

		this.chartData = {
			datasets: [
				{
					label: 'dataset 1',
					fillColor: 'rgba(220,220,220,0.2)',
					strokeColor: 'rgba(220,220,220,1)',
					pointColor: 'rgba(220,220,220,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
					data: []
				}
			]
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

		this.$scope.$watchCollection(::this.evalData, ::this.setData);

		this.$scope.$watch(::this.evalChartState, ::this.setChartState);
  }

	ngOnInit() {
		this.chartData.labels = this.generateMonthsLabels();
	}

	evalChartState() {
		return this.chartState;
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
    console.log(data);
		if (this.query.dimensions.includes('ga:hour')) {
			return this.generateHourLabels();
		} else if (this.query.dimensions.includes('ga:day') || this.query.dimensions.includes('ga:date') ) {
			return this.generateDaysLabels();
		} else if (this.query.dimensions.includes('ga:month')) {
			return this.generateMonthsLabels();
		} else {
      let labels = [];
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
		console.log(data, this.chartData);
		for (let i = 0; this.chartData.labels.length > i; i += 1) {
			if (typeof data[i] === 'undefined') {
				data[i] = null;
			}
		}
		return data;
	}

	openMenu($mdOpenMenu, event) {
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
		if (this.query.dimensions.includes('ga:month') || this.query.dimensions.includes('ga:nthMonth')) {
			label = row[1];
			return MONTHS[parseInt(label)];
		} else if (this.query.dimensions.includes('ga:week') || this.query.dimensions.includes('ga:nthWeek')) {
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

	resetState() {
		Object.keys(this.state).map((value, index) => { this.state[value] = false });
	}

	setChartState(current, prev) {
		if (current !== prev) {
			this.setState(this.chartState);
		}
	}

	setData(current, prev) {
		if (current !== prev) {
			console.log(current);
			let data = this.parseData(current);
			if (this.chartState === 'comparison' && this.fields.comparison) {
				let data2 = this.parseData(prev);
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
				this.chartData.labels = this.generateLabels(current);
				this.chartData.datasets[0].data = this.normalizeLabels(data2);
				this.chartData.datasets[1].data = this.normalizeLabels(data);
			} else if (this.chartState === 'composition') {
				this.resetChart();
				this.doughnutData = this.parseDoughnutData(current);
			} else {
				this.resetChart();
				this.chartData.labels = this.generateLabels(current);
				this.chartData.datasets[0].data = this.normalizeLabels(data);
			}
		}
	}

	resetChart() {
		this.chartData.datasets.length = 1;
		this.fields.comparison = false;
	}

	setState(state) {
		this.resetState();
		this.state[state] = true;
		if (this.chartState === 'composition') {
			this.doughnutData = this.parseDoughnutData(this.data);
		}
	}
}
