import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display';

@Component({
  selector: 'app-yearly-co2-emissions-chart',
  templateUrl: './yearly-co2-emissions-chart.component.html',
  styleUrls: ['./yearly-co2-emissions-chart.component.scss']
})
export class YearlyCo2EmissionsChartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  lineColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-17').trim();

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'line',
      style: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '1em',
      },
    },
    title: {
      text: 'Yearly CO₂ Emissions',
      margin: 50,
      style: {
        fontSize: '0.95em',
      }
    },
    credits: {
      enabled: false
    },
    xAxis: {
      categories: ['2019', '2020', '2021', '2022', '2023'],
    },
    yAxis: {
      title: {
        text: 'CO₂ Equivalents (kg)'
      }
    },
    exporting: {
      enabled: true,
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
      }
    },
    legend: {
      layout: 'vertical', 
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0,
   }
  };

  data = [34, 29, 25, 26, 23];

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
    HC_noData(Highcharts);
  }

  ngOnInit(): void {
    this.setChartData();
  }

  setChartData(): void {
    this.chartProperties.series = [
      {
        type: 'line',
        name: 'CO₂ Emissions',
        data: this.data.slice(),
        color: this.lineColor,
      },
    ];

    this.updateFlag = true;
  }
}
