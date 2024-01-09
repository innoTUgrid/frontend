import { Component, Input, OnInit, inject } from '@angular/core';

import * as Highcharts from 'highcharts/highstock';
import { HighchartsDiagram, DatasetKey, SeriesTypes, TimeSeriesKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { DataService } from '@app/services/data.service';
import { ChartService } from '@app/services/chart.service';



@Component({
  selector: 'app-energy-mix-diagram',
  templateUrl: './energy-mix-diagram.component.html',
  styleUrls: ['./energy-mix-diagram.component.scss']
})
export class EnergyMixDiagramComponent implements OnInit, HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);

  chart: Highcharts.Chart | undefined;
  updateFlag: boolean = false;
  seriesType: SeriesTypes = 'area';

  kpiName?: DatasetKey = TimeSeriesKey.SCOPE_2_EMISSIONS;
  
  subscriptions: Subscription[] = [];

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  constructor() {
  }


  ngOnInit() {
    this.subscriptions = this.chartService.subscribeSeries(this);

    if (this.kpiName) this.changeSeriesType(this.kpiName)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
      if (this.kpiName == TimeSeriesKey.SCOPE_2_EMISSIONS) this.changeSeriesType(TimeSeriesKey.ENERGY_CONSUMPTION);
      else this.changeSeriesType(TimeSeriesKey.SCOPE_2_EMISSIONS);
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
    this.toggleSeries.text = kpi == TimeSeriesKey.SCOPE_2_EMISSIONS ? 'Show Consumption' : 'Show Emissions';
    if (this.yAxis.title) this.yAxis.title.text = kpi == TimeSeriesKey.SCOPE_2_EMISSIONS ? 'CO₂ Emissions (kg)' : 'Consumption (kWh)';
    this.updateFlag = true;
    const lastKpi = this.kpiName;
    this.kpiName = kpi;

    if (kpi !== lastKpi) this.chartService.updateSeries(this);
  }

}

