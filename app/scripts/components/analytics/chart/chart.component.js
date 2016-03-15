import { Component, Input, Inject } from 'ng-forward';
import 'reflect-metadata';

@Component({
	selector: 'chart',
	controllerAs: 'Chart',
	template: require('./chart.html'),
	providers: ['tc.chartjs'],
  inputs: ['data']
})

@Inject()
export default class Chart {
  @Input() data;
	constructor() {
    this.data = [
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
    this.chartOptions =  {
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
  }
}
