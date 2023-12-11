import { Component, Input, OnInit } from '@angular/core';
import { Props } from 'src/app/types/props';
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
  @Input() props: Props = { value: [10, 20, 30] };
  kpiService: KpiService;

  green = '';
  yellow = '';
  orange = '';
  color3 = '';
  color4 = '';

  chart: Highcharts.Chart | undefined;
  colors: string[] = [this.green, this.yellow, this.orange, this.color3, this.color4];
  seriesType: SeriesTypes = 'area';
  
  constructor(kpiService: KpiService) {
    this.kpiService = kpiService;
  }

  set updateFlag(value: boolean) {
    if (value) this.chart?.update(this.chartProperties, true)
  }
  get updateFlag(): boolean { return false};

  ngOnInit() {
    this.green = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-0').trim();
    this.yellow = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-5').trim();
    this.orange = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-6').trim();
    this.color3 = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-3').trim();
    this.color4 = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-4').trim();
    this.initChart();

    this.kpiService.subscribeSeries(this, KPI.ENERGY_CONSUMPTION);
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
      text: 'Energy-mix',
      align: 'center',
    },
    credits: {enabled: false},

    xAxis: this.xAxis,
    yAxis: {
      title: {
        text: 'CO2 Emissions',
      },
    },
    plotOptions: {
      area: {
        dataGrouping: this.dataGrouping,
      }
    },

    series: [
      {
        name: 'Total',
        type: 'area', 
        color: this.green,
        marker:{
          lineColor: this.green,
        },
        data: [
          [new Date("2019-01-02T00:00:00.000Z"),38000 + 22534],
          [new Date("2019-01-02T01:00:00.000Z"),37300 + 23599],
          // 37892 + 24533,
          // 38564 + 25195,
          // 36770 + 25896,
          // 36026 + 27635,
          // 34978 + 29173,
          // 35657 + 32646,
          // 35620 + 35686,
          // 35971 + 37709,
          // 36409 + 39143,
          // 36435 + 36829,    
      ]
      },
      {
        name: 'Scope 1',
        type: 'area', 
        color: this.yellow,
        marker:{
          lineColor: this.yellow,
        },
        data: [
          [new Date("2019-01-02T00:00:00.000Z"),38000],
          [new Date("2019-01-02T01:00:00.000Z"),37300],
          // 37892,
          // 38564,
          // 36770,
          // 36026,
          // 34978,
          // 35657,
          // 35620,
          // 35971,
          // 36409,
          // 36435,
      ],
      },
      {
        name: 'Scope 2',
        type: 'area',
        color: this.orange,
        marker:{
          lineColor: this.orange,
        },
        data: [
              [new Date("2019-01-02T00:00:00.000Z"), 22534],
              // plus an hour
              [new Date("2019-01-02T01:00:00.000Z") , 23599],
              // 24533,
              // 25195,
              // 25896,
              // 27635,
              // 29173,
              // 32646,
              // 35686,
              // 37709,
              // 39143,
              // 36829,
          ],
      },
    ],
  };

  private initChart() {
    this.chart = Highcharts.chart(this.chartProperties);
  }
  
  
  

}

