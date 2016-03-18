import { Component, Input, Inject } from 'ng-forward';
import inflected from 'inflected';
import 'reflect-metadata';

@Component({
	selector: 'chart',
	controllerAs: 'Chart',
	template: require('./chart.html'),
	providers: ['tc.chartjs'],
  inputs: ['chartState', 'data', 'query']
})

@Inject('$scope')
export default class Chart {
	@Input() chartState;
  @Input() data;
	@Input() query;
	constructor($scope) {
		this.$scope = $scope;

		this.state = { trends: true, composition: false, comparison: false };

		this.chartData = {
			labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			datasets: [
				{
					label: 'My First dataset',
					fillColor: 'rgba(220,220,220,0.2)',
					strokeColor: 'rgba(220,220,220,1)',
					pointColor: 'rgba(220,220,220,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					data: []
				},
				{
					label: 'My Second dataset',
					fillColor: 'rgba(151,187,205,0.2)',
					strokeColor: 'rgba(151,187,205,1)',
					pointColor: 'rgba(151,187,205,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(151,187,205,1)',
					data: [28, 48, 40, 19, 86, 27, 90]
				}
			]
		};

		this.chartOptions = {
			limit: 100,
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

    this.doughnutData = [
      {
        value: 300,
        color:'rgba(220,220,220,0.5',
        highlight: 'rgba(220,220,220,1)',
        label: 'Red'
      },
      {
        value: 50,
        color: 'rgba(151,187,205,0.5)',
        highlight: 'rgba(151,187,205,1)',
        label: 'Green'
      },
      {
        value: 100,
        color: '#FDB45C',
        highlight: '#FFC870',
        label: 'Yellow'
      }
    ];
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
      legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
    };

		this.$scope.$watchCollection(::this.evalData, ::this.setData);
		this.$scope.$watch(() => {
			return this.chartState;
		}, (current, prev) => {
			if (current !== prev) {
				this.setState(this.chartState);
			}
		});
  }

	evalData() {
		return this.data;
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

	resetState() {
		Object.keys(this.state).map((value, index) => { this.state[value] = false });
	}

	renderUiName(item) {
		return inflected.humanize(inflected.underscore(item.replace(/(\d+)/, '$1 ').replace(/ga:/, '')));
	}

	setData(current, prev) {
		if (current !== prev) {
			let data = this.data.rows.map(row => {
				return row[2]
			});
			this.chartData.datasets[0].data = this.normalizeLabels(data);
		}
	}

	setState(state) {
		this.resetState();
		this.state[state] = true;
	}
}
