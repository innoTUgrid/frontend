import { Component, Input, OnInit, inject } from '@angular/core';

import * as Highcharts from 'highcharts/highstock';
import { HighchartsDiagram, DatasetKey, SeriesTypes, TimeSeriesEndpointKey, ArtificialDatasetKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { DataService } from '@app/services/data.service';
import { ChartService } from '@app/services/chart.service';
import { DataEvents, DatasetRegistry, EndpointUpdateEvent } from '@app/types/time-series-data.model';



@Component({
  selector: 'app-energy-mix-diagram',
  templateUrl: './energy-mix-diagram.component.html',
  styleUrls: ['./energy-mix-diagram.component.scss']
})
export class EnergyMixDiagramComponent implements HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);

  chart: Highcharts.Chart | undefined;
  updateFlag: boolean = false;
  seriesType: SeriesTypes = 'area';

  readonly id = "EnergyMixDiagramComponent." + Math.random().toString(36).substring(7);
  kpis: DatasetKey[] = [ArtificialDatasetKey.ALL_SCOPE_EMISSIONS_MERGED, TimeSeriesEndpointKey.ENERGY_CONSUMPTION]
  _kpiName: DatasetKey = this.kpis[0];

  get kpiName(): DatasetKey {
    return this._kpiName;
  }

  set kpiName(value: DatasetKey) {
    this._kpiName = value;
    if (value) {
      this.timeSeriesSubscriptions.forEach(sub => sub.unsubscribe())
      this.timeSeriesSubscriptions = this.chartService.subscribeSeries(this, this.kpiName);
    }
  }
  
  timeSeriesSubscriptions: Subscription[] = [];
  timeIntervalSubscription?: Subscription;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  constructor() {
  }

  getRegistryId(id: string, endpointKey: string) {
    return id + '-' + endpointKey
  }

  registries: DatasetRegistry[] = [
    {
      id:this.getRegistryId(this.id, this.kpis[0]),
      endpointKey: this.kpis[0], 
    },
    {
      id:this.getRegistryId(this.id, this.kpis[1]),
      endpointKey: this.kpis[1], 
    }
  ]

  ngOnInit(): void {
    if (this._kpiName) this.changeSeriesType(0)

    this.registries.forEach(registry => {this.dataService.registerDataset(registry)})
    this.timeIntervalSubscription = this.chartService.subscribeInterval(this)
  }


  ngOnDestroy() {
    this.unsubscribeAll()
    this.registries.forEach(registry => {this.dataService.unregisterDataset(registry)})
  }

  unsubscribeAll() {
    this.timeIntervalSubscription?.unsubscribe()
    this.timeIntervalSubscription = undefined;
    this.timeSeriesSubscriptions.forEach(sub => sub.unsubscribe())
    this.timeSeriesSubscriptions = [];
  }

  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [['day', [1]]]
  }

  xAxis: Highcharts.XAxisOptions[] = [{
    id: 'xAxis',
    type: 'datetime',
    dateTimeLabelFormats: {
      minute: '%H:%M',
    },
    tickPixelInterval: 50,
  }]

  yAxis: Highcharts.YAxisOptions = {
    title: {
      text: 'CO₂ Emissions (kg)',
    },
  }

  toggleSeries: Highcharts.ExportingButtonsOptionsObject = {
    onclick: () => {
      const index = this.kpis.indexOf(this.kpiName)
      this.changeSeriesType((index+1) % 2)
    }
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'area',
    },
    title: {
      text: 'Energy Mix',
    },
    tooltip: {
      valueSuffix: ' kg',
    },

    xAxis: this.xAxis,
    yAxis: this.yAxis,
    plotOptions: {
      area: {
        dataGrouping: this.dataGrouping,
        stacking: 'normal',
      }
    },
    exporting: {
      buttons: {
        toggleSeries: this.toggleSeries
      }
    },
  };

  changeSeriesType(index: number) {
    const kpi = this.kpis[index]
    this.toggleSeries.text = index === 0 ? 'Show Consumption' : 'Show Emissions';
    if (this.yAxis.title) this.yAxis.title.text = index === 0 ? 'CO₂ Emissions (kg)' : 'Consumption (kWh)';
    this.updateFlag = true;
    this.kpiName = kpi;
  }

}

