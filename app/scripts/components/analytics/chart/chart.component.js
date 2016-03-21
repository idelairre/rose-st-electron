import { Component, Input, Inject } from 'ng-forward';
import ChartTitle from './chart-title/chart-title.component';
import inflected from 'inflected';
import 'reflect-metadata';

// NOTE: this is arguably the worst code I've ever written but I was dealing with a bitter depression.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const HOURS = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

const HOURS_APM = ['1:00am', '2:00am', '3:00am', '4:00am', '5:00am', '6:00am', '7:00am', '8:00am', '9:00am', '10:00am', '11:00am', '12:00am', '1:00pm', '2:00pm', '3:00pm','4:00pm','5:00pm','6:00pm','7:00pm','8:00pm','9:00pm','10:00pm','11:00pm','12:00pm'];

@Component({
	selector: 'chart',
	controllerAs: 'Chart',
	template: require('./chart.html'),
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

		this.$scope.$watchCollection(::this.evalFields, ::this.setLabels);

		this.$scope.$watchCollection(::this.evalQuery, ::this.setLabels);

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

	evalFields() {
		return this.fields;
	}

	evalQuery() {
		return this.query.dimensions;
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

	generateHourLabels() {
		let startTime = this.$filter('date')(this.fields['start-date'], 'h:mma');
		let endTime = this.$filter('date')(this.fields['end-date'], 'h:mma');
		startTime = startTime.toLowerCase();
		endTime = endTime.toLowerCase();
		let labels = HOURS_APM.slice(HOURS_APM.indexOf(startTime), HOURS_APM.indexOf(endTime) + 1);
		return labels;
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
		this.fields['start-date'] = new Date(startDate.getFullYear() - 1, startDate.getDay(), startDate.getHours());
		this.fields['start-date'] = new Date(endDate.getFullYear() - 1, endDate.getDay(), startDate.getHours());
	}

	normalizeLabels(data) {
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
			return +row[2]
		});
	}

	parseDoughnutData(data) {
		let chartData = [];
		for (let i = 0; data.rows.length > i; i += 1) {
			chartData.push({ label: data.rows[i][0], value: data.rows[i][1], color: this.generateColor(), highlight: this.generateColor() });
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
				if (this.query.dimensions.includes('ga:hour')) {
					this.chartData.labels = this.generateHourLabels();
				} else if (this.query.dimensions.includes('ga:month')) {
					this.chartData.labels = this.generateMonthsLabels();
				}
				this.chartData.datasets[1].data = this.normalizeLabels(data);
				this.chartData.datasets[0].data = this.normalizeLabels(data2);
			} else if (this.chartState === 'composition') {
				console.log(current);
				this.doughnutData = this.parseDoughnutData(current);
				console.log(this.doughnutData);
			} else {
				// this.comparisonInitialized = true;
				this.chartData.datasets[0].data = this.normalizeLabels(data);
			}
		}
	}

	setLabels(current, prev) {
		if (current !== prev) {
			if (this.query.dimensions.includes('ga:hour') && this.query.dimensions.includes('ga:nthHour')) {
				this.chartData.labels = this.generateHourLabels();
			}
			if (this.query.dimensions.includes('ga:month') && this.query.dimensions.includes('ga:nthMonth')) {
				this.chartData.labels = this.generateMonthsLabels();
			}
			if (!current.comparison && prev.comparison) {
				// this.comparisonInitialized = false;
				this.chartData.datasets.length = 1;
			}
		}
	}

	setState(state) {
		this.resetState();
		this.state[state] = true;
		if (this.chartState === 'composition') {
			this.doughnutData = this.parseDoughnutData(this.data);
		}
	}
}
