import { Component, Input, OnInit } from '@angular/core';
import { KpiService } from 'src/app/services/kpi.service';

import * as Highcharts from 'highcharts/highstock';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsData from 'highcharts/modules/data';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { HighchartsDiagram, KPI, SeriesTypes } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';



HighchartsExporting(Highcharts);
HighchartsData(Highcharts);
HighchartsAccessibility(Highcharts);

@Component({
  selector: 'app-energy-mix-diagram',
  templateUrl: './energy-mix-diagram.component.html',
  styleUrls: ['./energy-mix-diagram.component.scss']
})
export class EnergyMixDiagramComponent implements OnInit, HighchartsDiagram {
  kpiService: KpiService;

  solarColor = '';
  windColor = '';
  biogasColor = '';
  color3 = '';
  color4 = '';

  chart: Highcharts.Chart | undefined;
  colors: string[] = [this.solarColor, this.windColor, this.biogasColor, this.color3, this.color4];
  seriesType: SeriesTypes = 'area';

  kpiName?: KPI = KPI.SCOPE_2_EMISSIONS;
  
  subscriptions: Subscription[] = [];

  constructor(kpiService: KpiService) {
    this.kpiService = kpiService;
    this.subscriptions = this.kpiService.subscribeSeries(this);

    if (this.kpiName) this.changeSeriesType(this.kpiName)
  }

  set updateFlag(value: boolean) {
    if (value) this.chart?.update(this.chartProperties, true)
  }
  get updateFlag(): boolean { return false};

  ngOnInit() {
    this.initChart();

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
      if (this.kpiName == KPI.SCOPE_2_EMISSIONS) this.changeSeriesType(KPI.ENERGY_CONSUMPTION);
      else this.changeSeriesType(KPI.SCOPE_2_EMISSIONS);
    }
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'area',
      renderTo: 'energyMixChart',
      
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

  changeSeriesType(kpi: KPI) {
    this.toggleSeries.text = kpi == KPI.SCOPE_2_EMISSIONS ? 'Show Consumption' : 'Show Emissions';
    if (this.yAxis.title) this.yAxis.title.text = kpi == KPI.SCOPE_2_EMISSIONS ? 'CO₂ Emissions (kg)' : 'Consumption (kWh)';
    this.chart?.update(this.chartProperties, true, true, true);
    if (kpi !== this.kpiName) this.kpiService.fetchTimeSeriesData(kpi, this.kpiService.timeInterval)
    
    this.kpiName = kpi;
  }

  private initChart() {
    this.chart = Highcharts.chart(this.chartProperties);
  }

}

