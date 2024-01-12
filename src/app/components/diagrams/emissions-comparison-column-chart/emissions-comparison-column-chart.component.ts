import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { Subscription, timeInterval } from 'rxjs';
import { HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, Series, TimeUnit } from '@app/types/time-series-data.model';


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
          format: '{point.y:.0f} kg',
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
        const relevantSeries: Series[] = data
        const newSeries: Series = {
          id: interval.start.toString() + '-' + interval.end.toString() + ' ' + index.toString(),
          name: interval.start.format('YYYY'),
          data: [],
          timeUnit: interval.stepUnit,
          type: interval.start.format('YYYY'),
          xAxis: index,
          color: (index == 0) ? this.earlierYearColor : this.laterYearColor,
          pointPlacement: (index == 0) ? -0.2 : undefined,
        }

        const dataMap = new Map<number, number>()
        for (const series of relevantSeries) {
          let i = 0;
          const data_len = series.data.length

          while (i < data_len) { // using this type of loop for performance reasons
            const point = series.data[i]
            if (point[0] >= interval.start.valueOf() && point[0] <= interval.end.valueOf()) {
              const value = dataMap.get(point[0])
              if (value) {
                dataMap.set(point[0], value + point[1])
              } else {
                dataMap.set(point[0], point[1])
              }
            }

            i++;
          }
        }

        const newDatapoints = Array.from(dataMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => [entry[0], entry[1]])
        newSeries.data = newDatapoints
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