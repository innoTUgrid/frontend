import { Component, Input, OnInit } from '@angular/core';
import { KpiService } from 'src/app/services/kpi.service';

import * as Highcharts from 'highcharts/highstock';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsData from 'highcharts/modules/data';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { HighchartsDiagram, KPI, SeriesTypes } from 'src/app/types/kpi.model';



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
  
  constructor(kpiService: KpiService) {
    this.kpiService = kpiService;
    this.kpiService.subscribeSeries(this);
  }

  set updateFlag(value: boolean) {
    if (value) this.chart?.update(this.chartProperties, true)
  }
  get updateFlag(): boolean { return false};

  ngOnInit() {
    this.initChart();

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
    yAxis: {
      title: {
        text: 'CO2 Emissions (kg)',
      },
    },
    plotOptions: {
      area: {
        dataGrouping: this.dataGrouping,
        stacking: 'normal',
      }
    },
  };

  private initChart() {
    this.chart = Highcharts.chart(this.chartProperties);
  }
  
  
  

}

