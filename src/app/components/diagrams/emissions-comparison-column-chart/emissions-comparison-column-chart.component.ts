import { Component, Input, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { Subscription, timeInterval } from 'rxjs';
import { ArtificialDatasetKey, HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { DataEvents, DatasetRegistry, EndpointUpdateEvent, Series, TimeUnit } from '@app/types/time-series-data.model';
import { sumAllDataTypes } from '@app/services/data-utils';

const addThousandsSeparator = ChartService.addThousandsSeparator

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

  @Input() timeIntervalIndices: number[] = [0, 1];

  id = "EmissionsComparisonColumnChartComponent." + Math.random().toString(36).substring(7);
  subscriptions: Subscription[] = [];
  kpiName = ArtificialDatasetKey.TOTAL_EMISSIONS;

  registry: DatasetRegistry = {
    id: this.id,
    endpointKey: this.kpiName,
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
      events: {
        redraw: () => {
          if (this.chart) this.chart.hideLoading()
        }
      }
    },
    title: {
      text: `Monthly CO₂ Emissions`,
    },
    
    xAxis: this.xAxis,
    yAxis: {
      title: {
        text: 'CO₂ Equivalents (kg)'
      }
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.0f} kg</b><br/>',
    },
    plotOptions: {
      column: {
        grouping: false,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          formatter: function() {
            const otherSeries = this.series.chart.series.find((s) => s.index !== this.series.index)

            // this is a hotfix to show only data labels for the baseline series when both have the same values
            if (this.y && (this.series.index == 1 ||
             (otherSeries && otherSeries.name != this.series.name)
            )) {
              return `${addThousandsSeparator(this.y.toFixed(0))} kg`
            }else return null
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

  splitYearlyData(data: Series[]): Series[] {
    const intervals = this.dataService.timeInterval.getValue().filter((interval, index) => this.timeIntervalIndices.includes(index))
    let newData = data
    
    if (intervals.length >= 2) {
      newData = []
      for (const [index, interval] of intervals.entries()) {
        const relevantSeries: Series|undefined = data.find(series => series.timeUnit === interval.stepUnit)
        let dataSummed: number[][] = []
        if (relevantSeries) {
          dataSummed = relevantSeries.data.filter((value:number[]) => value[0] >= interval.start.valueOf() && value[0] <= interval.end.valueOf())
        }
        const newSeries: Series = {
          id: `MonthlyCO2Comparision.${index.toString()}`,
          name: interval.start.format('YYYY'),
          data: dataSummed,
          timeUnit: interval.stepUnit,
          type: interval.start.format('YYYY'),
          xAxis: index,
          color: (index == 0) ? this.laterYearColor : this.earlierYearColor,
          pointPlacement: (index == 0) ? -0.2 : undefined,
        }

        newData.push(newSeries)
      }
    }
    // this is needed, because the baseline series has index 0, but should be drawn on top of the other
    return newData.reverse()
  }

  updateAverageLine() {
    if (this.chart) this.chartService.updateAverageLine(this.chart, false, 1, 'kg')
  }

  ngOnInit() {
    this.dataService.registerDataset(this.registry)

    this.subscriptions.push(
      this.chartService.subscribeSeries(this, this.kpiName, this.splitYearlyData.bind(this), this.updateAverageLine.bind(this))
    )
    this.subscriptions.push(this.chartService.subscribeInterval(this))
    this.dataService.on(DataEvents.BeforeUpdate, (event:EndpointUpdateEvent) => {
      if (event.endpointKey as string === this.kpiName && this.chart) this.chart.showLoading()
    }, this.id)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.registry)
    this.dataService.off(DataEvents.BeforeUpdate, this.id)
  }

}