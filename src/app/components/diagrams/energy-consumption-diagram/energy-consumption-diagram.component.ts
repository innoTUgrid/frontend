import { Component, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DatasetKey, HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent implements HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);
  kpiName: DatasetKey = TimeSeriesEndpointKey.ENERGY_CONSUMPTION;
readonly id = "EnergyConsumptionDiagramComponent." + Math.random().toString(36).substring(7);

  subscriptions: Subscription[] = [];

  chart: Highcharts.Chart|undefined
  seriesType: SeriesTypes = 'column';

  updateFlag = false

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  xAxis: Highcharts.XAxisOptions = {
    id: 'xAxis', // update xAxis and do not create a new one
    // title: {text:'Time'},
    type: 'datetime',
    dateTimeLabelFormats: {
      minute: '%H:%M',
    },
  }

  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [['day', [1]]]
  }

  plotLines: Highcharts.YAxisPlotLinesOptions = {
    width: 2,
    value: 0,
    zIndex: 5,
    
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Consumed Electricity by Source',
      style: {
        fontSize: '1em',
      }
    },
    credits: {
      enabled: false
    },
    xAxis: this.xAxis,
    yAxis: {
      min: 0,
      title: {
        text: 'Consumption (kWh)'
      },
    },
    tooltip: {
      valueSuffix: ' kWh',
      valueDecimals: 2,
    },
    exporting: {
      enabled: true,
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false
        },

        dataGrouping: this.dataGrouping,
      }
    },
  }

  onSeriesUpdate() {
    if (this.chart) this.chartService.updateAverageLine(this.chart, this.plotLines)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.id)
  }

  ngOnInit() {
    this.dataService.registerDataset({
      id: this.id,
      endpointKey: this.kpiName,
      beforeUpdate: () => {
        this.chart?.showLoading()
      }
    })

    this.subscriptions.push(this.chartService.subscribeSeries(this, this.kpiName, true))
    this.subscriptions.push(this.chartService.subscribeSeriesInterval(this))
  }
  
  constructor() {
  }

}
