import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DataService } from '@app/services/data.service';
import { ChartService } from '@app/services/chart.service';
import { HighchartsDiagram, SeriesTypes, SingleValueDiagram, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Subscription } from 'rxjs';
import { DatasetRegistry, TimeUnit } from '@app/types/time-series-data.model';

//import customPlugin from './customPlugin';

@Component({
  selector: 'app-gauge-series-co2-comparison',
  templateUrl: './gauge-series-co2-comparison.component.html',
  styleUrls: ['./gauge-series-co2-comparison.component.scss']
})
export class GaugeSeriesCo2ComparisonComponent implements OnInit, SingleValueDiagram {
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  dataService: DataService = inject(DataService);
  chartService: ChartService = inject(ChartService);

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  id = "GaugeSeriesCO2Comparision." + Math.random().toString(36).substring(7);
  subscriptions: Subscription[] = [];
  datasetKey = TimeSeriesEndpointKey.SCOPE_2_EMISSIONS;

  registry: DatasetRegistry = {
    id: this.id,
    endpointKey: this.datasetKey,
    beforeUpdate: () => {
      this.chart?.showLoading()
    }
  }

  _value:number[] = [];
  get value(): number[] {
    return this._value
  }

  set value(value: number[]) {
    this._value = value
    this.updateChart()
  }

  get percentageChange(): number | undefined {
    if (this.value.length < 2) {
      return undefined
    }
    if (this.value[0] === this.value[1]) return 0
    if (this.value[0] === 0) return Number.POSITIVE_INFINITY
    if (this.value[1] === 0) return Number.NEGATIVE_INFINITY
    const diff = this.value[1] - this.value[0]
    return diff/this.value[0] * 100
  }

  constructor() {
  }

  dateTimeLabelFormats: Highcharts.AxisDateTimeLabelFormatsOptions = {
    millisecond: '%b',
    second: '%b',
    minute: '%b',
    hour: '%b',
    day: '%b',
    week: '%b',
    month: '%b',
    year: '%b',
  }

  xAxis: Highcharts.XAxisOptions[] = [{
      id: 'first Year',
      type: 'datetime',
      dateTimeLabelFormats: this.dateTimeLabelFormats,
      tickPixelInterval: 50,
    }
  ]
  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [[TimeUnit.MONTH, [1]]]
  }

  get series(): Highcharts.SeriesOptionsType[] {
    if (this.percentageChange === undefined) return []
    return [{
      id: 'main',
      type: 'gauge',
      name: 'CO₂ Emissions',
      data: [Math.min(100, Math.max(-100, this.percentageChange))],
      dataLabels: {
        formatter: () => {
          if (this.percentageChange || this.percentageChange === 0) {
            return `${this.percentageChange} ${([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].includes(this.percentageChange)) ? '': '%'}`
          } else {
            return ''
          }
        },
        borderWidth: 0,
        color: (
          Highcharts.defaultOptions.title?.style?.color ?? '#FFFFFF'
        ),
        style: {
          fontSize: '1em'
        }
      },
      dial: {
        radius: '80%',
        backgroundColor: 'gray',
        baseWidth: 4,
        baseLength: '0%',
        rearLength: '0%',
        pivot: {
          backgroundColor: 'gray',
          radius: 6
        }
      } as any,
    }]
  }


  chartProperties: Highcharts.Options = {
    chart: {
      styledMode: false,
      type: 'gauge',
      style: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '1em',
      },
    },
    title: {
      text: 'CO₂ Emissions Increase',
      margin: 20,
      style: {
        fontSize: '1em',
      }
    },
    exporting: {enabled: true},
    tooltip: {enabled: false},
    credits: {enabled: false},
    pane: {
      center: ['50%', '85%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: undefined
    },
    yAxis: {
      min: -100,
      max: 100,
      tickPixelInterval: 72,
      tickInterval: 25,
      tickPosition: 'inside',
      tickColor: 'red',
      tickLength: 25,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
        distance: 25,
        useHTML: true,
        formatter() {
          let color = 'var(--highcharts-color-15)'; //red
          let valueNumber = Number(this.value);
          if (valueNumber < 0) { //green
            color = 'var(--highcharts-color-0)';
          }

          let prefix = ''
          if (valueNumber >= 100) prefix = '> '
          if (valueNumber <= -100) prefix = '< '

          return `<span style='font-size: 1.2em; font-weight: bold; color: ${color}'>${prefix}${this.value}%</span>`;
        },
      },
      plotBands: [
        {
          color: 'var(--highcharts-color-0)', // green
          from: -100,
          to: -1,
          thickness: 20,
        },
        {
          from: 0,
          to: 100,
          color: 'var(--highcharts-color-15)', // yellow
          thickness: 20,
        }
      ],
    },
    series: this.series
  };

  ngOnInit() {
    this.dataService.registerDataset(this.registry)

    this.subscriptions.push(...this.chartService.subscribeSingleValueDiagram(this, this.datasetKey))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.registry)
  }

  updateChart() {
    if (this.chart) this.chart.hideLoading()
    this.chartProperties.series = this.series
    this.updateFlag = true
  }


}
