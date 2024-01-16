import { Component, OnInit, inject } from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { sumAllDataTypes } from '@app/services/data-utils';
import { DataService } from '@app/services/data.service';
import { ArtificialDatasetKey, DatasetKey, HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, Series, TimeInterval, TimeUnit } from '@app/types/time-series-data.model';
import * as Highcharts from 'highcharts/highstock';
import moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-yearly-co2-emissions-chart',
  templateUrl: './yearly-co2-emissions-chart.component.html',
  styleUrls: ['./yearly-co2-emissions-chart.component.scss']
})
export class YearlyCo2EmissionsChartComponent implements OnInit, HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts;
  dataService: DataService = inject(DataService);
  chartService: ChartService = inject(ChartService);

  chart: Highcharts.Chart | undefined;
  updateFlag = false;
  id = "YearlyCo2EmissionsChartComponent." + Math.random().toString(36).substring(7);

  subscriptions: Subscription[] = [];

  dateTimeLabelFormats: Highcharts.AxisDateTimeLabelFormatsOptions = {
    millisecond: '%Y',
    second: '%Y',
    minute: '%Y',
    hour: '%Y',
    day: '%Y',
    week: '%Y',
    month: '%Y',
    year: '%Y',
  }

  xAxis: Highcharts.XAxisOptions[] = [{
    id: 'first Year',
    type: 'datetime',
    dateTimeLabelFormats: this.dateTimeLabelFormats,
    tickPixelInterval: 50,
  }]
  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [[TimeUnit.YEAR, [1]]]
  }
  seriesType: SeriesTypes = 'line'

  endpointKey: DatasetKey = ArtificialDatasetKey.EMISSIONS_TOTAL;
  registry: DatasetRegistry = {
    id: this.id,
    endpointKey: this.endpointKey,
    beforeUpdate: () => {
      this.chart?.showLoading()
    }
  }

  lineColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-0').trim();

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    if (!chart.series) chart.showLoading()
    this.chart = chart;
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'line',
      style: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '1em',
      },
    },
    title: {
      text: 'Yearly CO₂ Emissions',
      margin: 50,
      style: {
        fontSize: '0.95em',
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
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.0f} kg</b><br/>',
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
          format: '{point.y:,.0f} kg',
        },
        dataGrouping: this.dataGrouping
      }
    },
    legend: {
      layout: 'vertical', 
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0,
   }
  };

  constructor() {
  }

  loadYearlyData(data: Series[]): Series[] {
    const filtered =  data.filter(series => series.timeUnit === TimeUnit.YEAR)

    return [{
      id: 'Yearly CO₂ Emissions',
      name: 'Yearly CO₂ Emissions',
      type: 'emissions',
      data: filtered[0].data,
      timeUnit: TimeUnit.YEAR,
      color: this.lineColor,
    }]
  }


  ngOnInit() {
    this.dataService.registerDataset(this.registry)

    this.subscriptions.push(this.chartService.subscribeSeries(this, this.endpointKey, this.loadYearlyData.bind(this)))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.registry)
  }
}
