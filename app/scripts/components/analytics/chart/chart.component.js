import { Component, Input, Inject } from 'ng-forward';
import 'reflect-metadata';

@Component({
	selector: 'chart',
	controllerAs: 'Chart',
	template: require('./chart.html'),
	providers: ['tc.chartjs']
  // inputs: ['data']
})

@Inject()
export default class Chart {
  // @Input() data;
	constructor() {

		this.data = {
			labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
			datasets: [
				{
					label: 'My First dataset',
					fillColor: 'rgba(220,220,220,0.2)',
					strokeColor: 'rgba(220,220,220,1)',
					pointColor: 'rgba(220,220,220,1)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					data: [65, 59, 80, 81, 56, 55, 40]
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

    // this.data = [
    //   {
    //     value: 300,
    //     color:'rgba(220,220,220,0.5',
    //     highlight: 'rgba(220,220,220,1)',
    //     label: 'Red'
    //   },
    //   {
    //     value: 50,
    //     color: 'rgba(151,187,205,0.5)',
    //     highlight: 'rgba(151,187,205,1)',
    //     label: 'Green'
    //   },
    //   {
    //     value: 100,
    //     color: '#FDB45C',
    //     highlight: '#FFC870',
    //     label: 'Yellow'
    //   }
    // ];
    // this.chartOptions = {
    //   responsive: true,
    //   segmentShowStroke : true,
    //   segmentStrokeColor : '#fff',
    //   segmentStrokeWidth : 2,
    //   percentageInnerCutout : 50, // This is 0 for Pie charts
    //   animationSteps : 100,
    //   animationEasing : 'easeOutBounce',
    //   animateRotate : true,
    //   animateScale : false,
    //   legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
    // };
  }
}
