import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DataService } from '@app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-emissions-by-scope',
  templateUrl: './emissions-by-scope.component.html',
  styleUrls: ['./emissions-by-scope.component.scss']
})
export class EmissionsByScopeComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  dataService: DataService = inject(DataService);

  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  subscriptions: Subscription[] = [];
  scope1 = 25647;
  scope2 = 12550
  scope3 = 36370

  

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    if (!chart.series) chart.showLoading()
    this.chart = chart;
  }

  pieChartProperties: Highcharts.Options = {
    chart: {
      styledMode: false,
      type: 'pie',
      style: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '1em',
      },
    },
    title: {
      text: 'CO₂ Emissions by Scope',
      margin: 50,
      style: {
        fontSize: '0.95em',
      }
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
    credits: {enabled: false},
    exporting: {enabled: true},
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
    
    series: [
      {
        name: 'Emissions',
        colorByPoint: true,
        data: [
          {
            name: 'Scope 1',
            y: this.scope1,
            colorIndex: 'var(--highcharts-color-4)',
            color: 'var(--highcharts-color-4)',
            trend: '↑',
          },
          {
            name: 'Scope 2',
            y: this.scope2,
            colorIndex: 'var(--highcharts-color-0)',
            color: 'var(--highcharts-color-0)',
            trend: '↓', 
          },
          {
            name: 'Scope 3',
            y: this.scope3,
            colorIndex: 'var(--highcharts-color-12)',
            color: 'var(--highcharts-color-12)',
            trend: '↑', 
          },
        ] as any,
        type: 'pie',
      },
    ] as any,
  };
  

  constructor() {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
  }
}
