import { Component, Input, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DataService } from '@app/services/data.service';
import { ChartService } from '@app/services/chart.service';
import { ArtificialDatasetKey, HighchartsDiagram, SeriesTypes, SingleValueDiagram, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Subscription } from 'rxjs';
import { DataEvents, DatasetRegistry, EndpointUpdateEvent, TimeUnit } from '@app/types/time-series-data.model';

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
  datasetKey = ArtificialDatasetKey.TOTAL_EMISSIONS;

  @Input() timeIntervalIndices: number[] = [0, 1];

  registry: DatasetRegistry = {
    id: this.id,
    endpointKey: this.datasetKey,
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
    const i1 = this.timeIntervalIndices[0]
    const i2 = this.timeIntervalIndices[1]
    if (Math.max(i1,i2) >= this.value.length) {
      return undefined
    }
    if (this.value[i1] === this.value[i2]) return 0
    if (this.value[i1] === 0) return Number.POSITIVE_INFINITY
    const diff = this.value[i2] - this.value[i1]
    return diff/this.value[i1] * 100
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
            return `${this.percentageChange.toFixed(1)} ${(this.percentageChange === Number.POSITIVE_INFINITY) ? '': '%'}`
          } else {
            return ''
          }
        },
        borderWidth: 0,
        color: (
          Highcharts.defaultOptions.title?.style?.color ?? '#FFFFFF'
        ),
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
      type: 'gauge',
    },
    title: {
      text: 'CO₂ Emissions Increase',
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

    this.subscriptions.push(...this.chartService.subscribeSingleValueDiagram(this, this.datasetKey, false))
    this.dataService.on(DataEvents.BeforeUpdate, (event:EndpointUpdateEvent) => {
      if (this.chart) this.chart.showLoading()
    }, this.id)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.registry)
    this.dataService.off(DataEvents.BeforeUpdate, this.id)
  }

  updateChart() {
    if (this.chart) this.chart.hideLoading()
    this.chartProperties.series = this.series
    this.updateFlag = true
  }


}
