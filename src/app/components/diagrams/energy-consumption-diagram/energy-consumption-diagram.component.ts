import { Component, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DatasetKey, HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { DataEvents, DatasetRegistry, EndpointUpdateEvent, Series } from '@app/types/time-series-data.model';
import { sumAllDataTypes, toSeriesId } from '@app/services/data-utils';

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
    if (!chart.series) chart.showLoading()
    this.chart = chart;
  }

  registry: DatasetRegistry = {
    id: this.id,
    endpointKey: this.kpiName,
  }

  xAxis: Highcharts.XAxisOptions[] = [{
    id: 'xAxis', // update xAxis and do not create a new one
    // title: {text:'Time'},
    type: 'datetime',
    dateTimeLabelFormats: {
      minute: '%H:%M',
    },
    tickPixelInterval: 50,
  }]

  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [['day', [1]]]
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
      events: {
        redraw: () => {
          if (this.chart) this.chartService.updateAverageLine(this.chart, true)
        }
      }
    },
    title: {
      text: 'Consumed Energy by Source',
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


  aggregateExternalData(data: Series[]): Series[] {
    const dataFiltered = this.chartService.filterOtherStepUnits(data)
    const currentTimeInterval = this.dataService.getCurrentTimeInterval()

    const externalEnergy = sumAllDataTypes(dataFiltered.filter(entry => !entry.local))
    const type = 'total-external'
    const newData: Series[] = [
      {
      id: toSeriesId(this.registry.endpointKey, type, false, currentTimeInterval.stepUnit),
      name: 'Imported Energy',
      type: type,
      data: externalEnergy,
      timeUnit: this.dataService.getCurrentTimeInterval().stepUnit,
      xAxis: 0
    }, 
    ...dataFiltered.filter(entry => entry.local)]

    return newData
  }

  ngOnInit() {
    this.dataService.registerDataset(this.registry)

    this.subscriptions.push(this.chartService.subscribeSeries(this, this.kpiName, this.aggregateExternalData.bind(this)))
    this.subscriptions.push(this.chartService.subscribeInterval(this))
    this.dataService.on(DataEvents.BeforeUpdate, (event:EndpointUpdateEvent) => {
      if (event.endpointKey === this.kpiName && this.chart) this.chart.showLoading()
    }, this.id)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
    this.dataService.unregisterDataset(this.registry)
    this.dataService.off(DataEvents.BeforeUpdate, this.id)
  }
  
  constructor() {
  }

}
