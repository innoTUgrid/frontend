import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DataService } from '@app/services/data.service';
import { Subscription } from 'rxjs';
import { Dataset, DatasetRegistry } from '@app/types/time-series-data.model';
import { TimeSeriesEndpointKey } from '@app/types/kpi.model';

@Component({
  selector: 'app-emissions-by-scope',
  templateUrl: './emissions-by-scope.component.html',
  styleUrls: ['./emissions-by-scope.component.scss']
})
export class EmissionsByScopeComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  dataService: DataService = inject(DataService);
  id = "EmissionsByScope." + Math.random().toString(36).substring(7);

  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  registries: DatasetRegistry[] = [
    { id: this.id, endpointKey: TimeSeriesEndpointKey.SCOPE_1_EMISSIONS },
    { id: this.id, endpointKey: TimeSeriesEndpointKey.SCOPE_2_EMISSIONS }
  ]

  subscriptions: Subscription[] = [];

  data = [
    {
      name: 'Scope 1',
      y: 20,
      colorIndex: 'var(--highcharts-color-4)',
      color: 'var(--highcharts-color-4)',
      trend: '↑',
    },
    {
      name: 'Scope 2',
      y: 40,
      colorIndex: 'var(--highcharts-color-0)',
      color: 'var(--highcharts-color-0)',
      trend: '↓', 
    },
  ]

  series: Highcharts.SeriesOptionsType[] = [
    {
      name: 'Emissions',
      colorByPoint: true,
      data: this.data,
      type: 'pie',
    } as any,
  ]

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    if (!chart.series) chart.showLoading()
    this.chart = chart;
  }

  pieChartProperties: Highcharts.Options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: 'CO₂ Emissions by Scope',
    },
    tooltip: {
      useHTML: true,
      pointFormatter: function () {
        const point = this as Highcharts.Point & { trend: string };
        const color = point.color || 'black';
        const formattedY = (point.y ?? 0).toLocaleString('de-DE');
        return `

          <b style="color: ${color};">Emissions</b>: 
          <b>${formattedY} kg</b>
        `;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false, 
        },
        showInLegend: true, 
      },
    },
  
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: {
        fontWeight: 'normal',
      },
      itemWidth: 250, 
      labelFormatter: function () {
        const point = this as Highcharts.Point & { trend: string }; 
        
        const trend = point.trend === '↑' ? '↑' : '↓';
        const color = point.color || 'black'; 

        const formattedY = (point.y ?? 0).toLocaleString('de-DE');
        const formattedPercentage = point.percentage?.toFixed(2) ?? '0';

        return `
          <b>${point.name}</b>:&nbsp;&nbsp;
          <span style="color: ${color};">${formattedY} kg</span>
          &nbsp;${trend}&nbsp;
          <span>${formattedPercentage}%</span>
        `;
      },
    },
    
    series: this.series,
  };
  

  constructor() {
  }



  ngOnInit() {
    for (const [index, registry] of this.registries.entries()) {
      this.dataService.registerDataset(registry)
    }
  }

  ngOnDestroy() {
    this.registries.forEach((registry) => this.dataService.unregisterDataset(registry))
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
  }
}
