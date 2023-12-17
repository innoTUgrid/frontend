import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';
import NoData from 'highcharts/modules/no-data-to-display'
import Exporting from 'highcharts/modules/exporting';
HighchartsMore(Highcharts);
SolidGauge(Highcharts);
NoData(Highcharts);
Exporting(Highcharts);

@Component({
  selector: 'app-scope-emission-comparision',
  templateUrl: './scope-emission-comparision.component.html',
  styleUrls: ['./scope-emission-comparision.component.scss']
})
export class ScopeEmissionComparisionComponent {
  Highcharts: typeof Highcharts = Highcharts; // required
  updateFlag: boolean = false;
  chart?: Highcharts.Chart;

  chartCallback(chart: Highcharts.Chart) {
    this.chart = chart
  }

  chartProperties: Highcharts.Options = {
    chart: {
    },
    title: {
      text: 'CO2 Emissions Comparison per Scope',
      style: {
        fontSize: '1em',
      }
    },
    tooltip: {
      borderWidth: 0,
      shadow: false,
      style: {
          fontSize: '16px'
      },
      valueSuffix: '%',
      pointFormat: '{series.name}<br>{point.x}<br>' +
          '<span style="font-size: 2em; color: {point.color}; <br>' +
          'font-weight: bold">{point.y}</span>',
      positioner: function (labelWidth) {
          return {
              x: (this.chart.chartWidth - labelWidth) / 2,
              y: (this.chart.plotHeight / 2) + 15
          };
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickPositions: []
    },
    credits: { enabled: false },
    plotOptions: {
      pie: {
          dataLabels: {
              enabled: true,
              format: '{point.percentage:.1f} %',
          },
          linecap: 'round',
          stickyTracking: false,
      },
      series: {
        dataLabels: [{
          enabled: true,
          distance: 50,
          format: '{point.name}',
      }, {
          enabled: true,
          distance: -25,
          format: '{point.percentage:.0f}%',
          style: {
              fontSize: '1em',
              textOutline: 'none',
              opacity: 0.7
          },
          filter: {
              operator: '>',
              property: 'percentage',
              value: 10
          }
      }]
      } as any
    },
    series: [
      {
        type: 'pie',
        name: '2022',
        size: '100%',
        innerSize: '70%',
        data: [{
          name: 'Scope 1 (2022)',
          colorIndex: 0,
          y: 80,
          x: 400
        },
        {
          name: 'Scope 2 (2022)',
          colorIndex: 1,
          y: 20,
          x: 100
        }
      ]
      },
      {
        type: 'pie',
        name: '2023',
        size: '70%',
        innerSize: '60%',
        data: [{
          name: 'Scope 1 (2023)',
          colorIndex: 0,
          y: 65,
          x: 400
        },{
          name: 'Scope 2 (2023)',
          colorIndex: 1,
          y: 35,
          x: 200
        }

      ]
      },
    ]
  }

}
