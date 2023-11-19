
import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-single-value-chart',
  templateUrl: './single-value-chart.component.html',
  styleUrls: ['./single-value-chart.component.scss']
})
export class SingleValueChartComponent {
  @Input() value: number = 0;
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() unit: string = '';
  @Input() trend: number = 0;
  Highcharts: typeof Highcharts = Highcharts; // required

  get changeIcon(): string {
    if (this.trend == 0) return 'trending_flat'
    return this.trend > 0 ? 'trending_up' : 'trending_down';
  }
  
  chart?: Highcharts.Chart
  chartProperties: Highcharts.Options= {
    chart: {
      styledMode: true,
      type: 'spline',
      height: "50%",
    },
    title: {text:''},
    exporting:{enabled:false},
    credits:{enabled: false},
    legend:{enabled:false},
    pane:{},
    tooltip:{enabled:false},
    series: [
      {
        type: 'spline',
        enableMouseTracking: false,
        dataLabels: {
          enabled: false
        },
        data: [1, 2, 2, 4, 5]
      }
    ],
    yAxis: {
      visible: false,
      title: {
        text:''
      },
    },
    xAxis: {
      visible: false
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false
        },
      }
    },

  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
    this.updateChart()
  }

  updateChart() {

  }
}
