import { Component, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DatasetKey, HighchartsDiagram, SeriesTypes, TimeSeriesEndpointKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { DataEvents, DatasetRegistry, EndpointUpdateEvent, Series } from '@app/types/time-series-data.model';
import { sumAllDataTypes, toSeriesId } from '@app/services/data-utils';
import { ThemeService } from '@app/services/theme.service';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent implements HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);
  themeService: ThemeService = inject(ThemeService);
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
    const dataFiltered = this.chartService.filterOtherStepUnits(data);
    const currentTimeInterval = this.dataService.getCurrentTimeInterval();
  
    const renewableSources = ['biogas-local', 'biogas', 'biomass', 'other-renewables', 'offwind', 'hydro', 'onwind', 'solar', 'solar-local'];
    
    const importedEnergy = dataFiltered.filter(entry => !entry.local);
    const renewableEnergy = importedEnergy.filter(entry => renewableSources.includes(entry.type));
    const nonRenewableEnergy = importedEnergy.filter(entry => !renewableSources.includes(entry.type));
  
    const renewableType = 'total-renewable';
    const nonRenewableType = 'total-non-renewable';

    const newData: Series[] = []
    if (renewableEnergy.length > 0) {
      newData.push({
        id: toSeriesId(this.registry.endpointKey, renewableType, false, currentTimeInterval.stepUnit),
        name: 'Imported Energy (renewable)',
        type: renewableType,
        data: sumAllDataTypes(renewableEnergy),
        timeUnit: currentTimeInterval.stepUnit,
        color: this.themeService.colorMap.get(renewableType),
        xAxis: 0,
      })
    } 
    if (nonRenewableEnergy.length > 0) {
      newData.push({
        id: toSeriesId(this.registry.endpointKey, nonRenewableType, false, currentTimeInterval.stepUnit),
        name: 'Imported Energy (non-renewable)',
        type: nonRenewableType,
        data: sumAllDataTypes(nonRenewableEnergy),
        timeUnit: currentTimeInterval.stepUnit,
        color: this.themeService.colorMap.get(nonRenewableType),
        xAxis: 0,
      })
    }

    newData.push(...dataFiltered.filter(entry => entry.local))
    return newData;
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
