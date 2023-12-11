
import { Component, Input, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { KpiService } from 'src/app/services/kpi.service';
import { KPI, SeriesTypes, SingleValueDiagram } from 'src/app/types/kpi.model';
import NoData from 'highcharts/modules/no-data-to-display'
NoData(Highcharts);

@Component({
  selector: 'app-single-value-chart',
  templateUrl: './single-value-chart.component.html',
  styleUrls: ['./single-value-chart.component.scss']
})
export class SingleValueChartComponent implements SingleValueDiagram {
  kpiService: KpiService = inject(KpiService);
  _value: number = 0;
  @Input() set value (value: number) {
    this._value = value;
  }
  get value(): number {
    return this._value;
  }

  get valueFormatted(): string {
    // only 2 digits after comma
    return this.value.toFixed(2);
  }

  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() unit: string = '';
  @Input() kpiName: KPI = KPI.AUTARKY;
  Highcharts: typeof Highcharts = Highcharts; // required


  xAxis: Highcharts.XAxisOptions = {visible: false};
  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [['day', [1]]]
  }
  updateFlag: boolean = false;
  seriesType: SeriesTypes = 'spline';
  colors: string[] = [];

  chart: Highcharts.Chart | undefined
  chartProperties: Highcharts.Options= {
    chart: {
      styledMode: true,
      type: 'spline',
    },
    title: {text:''},
    exporting:{enabled:false},
    credits:{enabled: false},
    legend:{enabled:false},
    pane:{},
    tooltip:{enabled:false},
    yAxis: {
      visible: false,
      title: {
        text:''
      },
    },
    xAxis: this.xAxis,
    plotOptions: {
      series: {
        marker: {
          enabled: false
        },
        enableMouseTracking: false,
        dataGrouping: this.dataGrouping,
      }
    },

  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  constructor() {
    this.kpiService.subscribeSingleValueDiagram(this, this.kpiName, false);
    this.kpiService.subscribeEnergyDiagram(this, this.kpiName)
  }
}
