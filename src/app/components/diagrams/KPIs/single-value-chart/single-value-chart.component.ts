
import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';

@Component({
  selector: 'app-single-value-chart',
  templateUrl: './single-value-chart.component.html',
  styleUrls: ['./single-value-chart.component.scss']
})
export class SingleValueChartComponent {
  _value: number = 0;
  @Input() set value(value: number) {
    this._value = value;
    this.updateSubtitle()
  }
  get value(): number {
    return this._value;
  }

  @Input() set title(value: string) {
    this.chartProperties.title!.text = value;
    this.updateFlag = true;
  }
  get title(): string {
    return this.chartProperties.title!.text!;
  }
  
  _unit: string = '';
  @Input() set unit(value: string) {
    this._unit = value;
    this.updateSubtitle()
  }
  get unit(): string {
    return this._unit;
  }

  @Input() icon: string = '';
  @Input() trend: number = 0;
  Highcharts: typeof Highcharts = Highcharts; // required
  updateFlag: boolean = false;

  get changeIcon(): string {
    if (this.trend == 0) return 'trending_flat'
    return this.trend > 0 ? 'trending_up' : 'trending_down';
  }

  subtitle: Highcharts.SubtitleOptions = {
    text: '',
    useHTML: true,
    style: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'black',
    }
  }

  chart?: Highcharts.Chart
  chartProperties: Highcharts.Options= {
    chart: {
      type: 'spline',
    },
    title: {
      text:'',
      verticalAlign: 'bottom',
      align: 'center',
    },
    subtitle: this.subtitle,

    exporting:{
      enabled:true,
    },
    credits:{enabled: false},
    legend:{enabled:false},
    tooltip:{enabled:false},
    series: [
      {
        type: 'spline',
        enableMouseTracking: false,
        data: [1, 2, 2, 4, 5],
      },
    ],
    yAxis: {visible: false,},
    xAxis: {visible: false,},
    plotOptions: {
      series: {
        marker: {
          enabled: false
        },
      }
    },

  }

  updateSubtitle() {
    this.subtitle.text = this.value.toString() + ' ' + this.unit;
    this.updateFlag = true;
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
  }
}
