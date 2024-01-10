import { Component, Input, OnInit, inject } from '@angular/core';

import * as Highcharts from 'highcharts/highstock';
import { HighchartsDiagram, DatasetKey, SeriesTypes, TimeSeriesEndpointKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { DataService } from '@app/services/data.service';
import { ChartService } from '@app/services/chart.service';



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
  _kpiName: DatasetKey = TimeSeriesEndpointKey.SCOPE_2_EMISSIONS;

  get kpiName(): DatasetKey {
    return this._kpiName;
  }

  set kpiName(value: DatasetKey) {
    this._kpiName = value;
    if (value) {
      this.timeSeriesSubscription?.unsubscribe()
      this.timeSeriesSubscription = this.chartService.subscribeSeries(this, this.kpiName);
    }
  }
  
  timeSeriesSubscription?: Subscription;
  timeIntervalSubscription?: Subscription;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  constructor() {
  }

  getRegistryId(id: string, endpointKey: string) {
    return id + '-' + endpointKey
  }

  ngOnInit(): void {
    if (this._kpiName) this.changeSeriesType(this._kpiName)
    this.dataService.registerDataset(
      {
        id:this.getRegistryId(this.id, TimeSeriesEndpointKey.SCOPE_2_EMISSIONS),
        endpointKey: TimeSeriesEndpointKey.SCOPE_2_EMISSIONS, 
      })
    this.dataService.registerDataset(
      {
        id:this.getRegistryId(this.id, TimeSeriesEndpointKey.ENERGY_CONSUMPTION),
        endpointKey: TimeSeriesEndpointKey.ENERGY_CONSUMPTION, 
      })
    this.timeIntervalSubscription = this.chartService.subscribeSeriesInterval(this)
  }


  ngOnDestroy() {
    this.unsubscribeAll()
    this.dataService.unregisterDataset(this.getRegistryId(this.id, TimeSeriesEndpointKey.SCOPE_2_EMISSIONS))
    this.dataService.unregisterDataset(this.getRegistryId(this.id, TimeSeriesEndpointKey.ENERGY_CONSUMPTION))
  }

  unsubscribeAll() {
    this.timeIntervalSubscription?.unsubscribe()
    this.timeIntervalSubscription = undefined;
    this.timeSeriesSubscription?.unsubscribe()
    this.timeSeriesSubscription = undefined;
  }

  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [['day', [1]]]
  }

  xAxis: Highcharts.XAxisOptions = {
    id: 'xAxis',
    type: 'datetime',
    dateTimeLabelFormats: {
      minute: '%H:%M',
    },
  }

  yAxis: Highcharts.YAxisOptions = {
    title: {
      text: 'CO₂ Emissions (kg)',
    },
  }

  toggleSeries: Highcharts.ExportingButtonsOptionsObject = {
    // change button text between consumption end emissions when it is clicked
    onclick: () => {
      if (this.kpiName == TimeSeriesEndpointKey.SCOPE_2_EMISSIONS) this.changeSeriesType(TimeSeriesEndpointKey.ENERGY_CONSUMPTION);
      else this.changeSeriesType(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS);
    }
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'area',
    },
    title: {
      text: 'Energy Mix',
      align: 'center',
      style: {
        fontSize: '1em',
      }
    },
    credits: {enabled: false},
    tooltip: {
      valueSuffix: ' kg',
      valueDecimals: 2, 
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
      enabled: true,
      buttons: {
        toggleSeries: this.toggleSeries
      }
    },
  };

  changeSeriesType(kpi: DatasetKey) {
    this.toggleSeries.text = kpi == TimeSeriesEndpointKey.SCOPE_2_EMISSIONS ? 'Show Consumption' : 'Show Emissions';
    if (this.yAxis.title) this.yAxis.title.text = kpi == TimeSeriesEndpointKey.SCOPE_2_EMISSIONS ? 'CO₂ Emissions (kg)' : 'Consumption (kWh)';
    this.updateFlag = true;
    this.kpiName = kpi;
  }

}

