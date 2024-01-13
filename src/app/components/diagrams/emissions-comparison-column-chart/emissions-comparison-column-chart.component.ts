import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { Subscription, timeInterval } from 'rxjs';
import { HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, Series, TimeUnit } from '@app/types/time-series-data.model';

const numberWithCommas = ChartService.numberWithCommas

@Component({
  selector: 'app-emissions-comparison-column-chart',
  templateUrl: './emissions-comparison-column-chart.component.html',
  styleUrls: ['./emissions-comparison-column-chart.component.scss']
})
export class EmissionsComparisonColumnChartComponent implements OnInit, HighchartsDiagram{
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);

  id = "EmissionsComparisonColumnChartComponent." + Math.random().toString(36).substring(7);
  subscriptions: Subscription[] = [];
  kpiName = TimeSeriesEndpointKey.SCOPE_2_EMISSIONS;

  registry: DatasetRegistry = {
    id: this.id,
    endpointKey: this.kpiName,
    beforeUpdate: () => {
      this.chart?.showLoading()
    }
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
  }, 
  {
    id: 'second Year',
    type: 'datetime',
    // dateTimeLabelFormats: this.dateTimeLabelFormats,
    visible: false,
  }
]

  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [[TimeUnit.MONTH, [1]]]
  }
  seriesType: SeriesTypes = 'column'

  earlierYear = 2022;
  laterYear = 2023;

  earlierYearColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-16').trim();
  laterYearColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-0').trim();
  meanColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-neutral-color-40').trim();

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    if (!chart.series) chart.showLoading()
    this.chart = chart;
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: this.seriesType,
      style: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '1em',
      },
    },
    title: {
      text: `Monthly CO₂ Emissions Comparison`,
      margin: 50,
      style: {
        fontSize: '1em',
      }
    },
    
    credits: {
      enabled: false
    },
    xAxis: this.xAxis,
    yAxis: {
      title: {
        text: 'CO₂ Equivalents (kg)'
      }
    },
    exporting: {
      enabled: true,
    },
    plotOptions: {
      column: {
        grouping: false,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          formatter: function () {
            if (!this.y) return ''
            return numberWithCommas(this.y.toFixed(0)) + ' kg';
          }
        },
        groupPadding: 0.1, // Adjust this value as needed

        dataGrouping: this.dataGrouping,
      },
    },
    legend: {
      layout: 'vertical', 
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0,
      title: {
          text: 'Years'
      }
     
  },
  };

  constructor() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.registry)
  }

  splitYearlyData(data: Series[]): Series[] {
    const intervals = this.dataService.getCurrentComparisionTimeIntervals()
    let newData = data
    
    if (intervals.length >= 2) {
      newData = []
      for (const [index, interval] of [intervals[0], intervals[1]].entries()) {
        const relevantSeries: Series[] = data.filter(series => series.timeUnit === interval.stepUnit)
        const newSeries: Series = {
          id: `MonthlyCO2Comparision.${index.toString()}`,
          name: interval.start.format('YYYY'),
          data: this.chartService.sumAllDataTypes(relevantSeries, interval),
          timeUnit: interval.stepUnit,
          type: interval.start.format('YYYY'),
          xAxis: index,
          color: (index == 0) ? this.earlierYearColor : this.laterYearColor,
          pointPlacement: (index == 0) ? -0.2 : undefined,
        }

        newData.push(newSeries)
      }
    }
    return newData
  }

  ngOnInit() {
    this.dataService.registerDataset(this.registry)

    this.subscriptions.push(this.chartService.subscribeSeries(this, this.kpiName, this.splitYearlyData.bind(this)))
    this.subscriptions.push(this.chartService.subscribeInterval(this))
  }

  onSeriesUpdate() {
    if (this.chart) {
      this.chartService.updateAverageLine(this.chart, false)
    }
  }
}