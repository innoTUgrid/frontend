import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display';


@Component({
  selector: 'app-emissions-comparison-column-chart',
  templateUrl: './emissions-comparison-column-chart.component.html',
  styleUrls: ['./emissions-comparison-column-chart.component.scss']
})
export class EmissionsComparisonColumnChartComponent implements OnInit{
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  earlierYear = 2022;
  laterYear = 2023;

  earlierYearColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-16').trim();
  laterYearColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-0').trim();
  meanColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-1').trim();

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
      style: {
        fontFamily: 'Lucida Grande, sans-serif',
        fontSize: '1em',
      },
    },
    title: {
      text: `Emissions comparison of year ${this.laterYear} to ${this.earlierYear}`,
      margin: 50,
      style: {
        fontSize: '0.95em',
      }
    },
    
    credits: {
      enabled: false
    },
    xAxis: {
      categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
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
      column: {
        grouping: false,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
        },
        groupPadding: 0.1, // Adjust this value as needed
      },
    },
    legend: {
      layout: 'vertical', 
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0,
      title: {
          text: 'Years'
      }
     
  },
  };

  data = {
    2023: [
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 23],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 23],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 23],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 23],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 23],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 12],
    ],
    2022: [
      ['CO₂ Emissions', 22],
      ['CO₂ Emissions', 27],
      ['CO₂ Emissions', 15],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 24],
      ['CO₂ Emissions', 29],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 26],
      ['CO₂ Emissions', 25],
      ['CO₂ Emissions', 20],
      ['CO₂ Emissions', 23],
      ['CO₂ Emissions', 20],
    ],
  };

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
    HC_noData(Highcharts);
  }

  ngOnInit(): void {
    this.setChartData();
  }

  setChartData(): void {
    const earlierYear = this.earlierYear; 
    const laterYear = this.laterYear;
    const dataAsObject: { [key: number]: (string | number)[][] } = this.data;
    const earlierYearData = this.getData(dataAsObject[earlierYear], earlierYear);
    const laterYearData = this.getData(dataAsObject[laterYear], laterYear);
  
   
    //const meanData = dataAsObject[laterYear].reduce((sum, point) => sum + point[1], 0)
    const meanData = dataAsObject[laterYear].reduce((sum, point) => sum + Number(point[1]), 0) / dataAsObject[laterYear].length;
    const roundedMeanData = Number(meanData.toFixed(2));
    const meanDataArray = Array.from({ length: 12 }, () => roundedMeanData);

  
    this.chartProperties.series = [
      {
        type: 'column', 
        name: earlierYear.toString(),
        id: 'main',
        pointPlacement: -0.1,
        data: earlierYearData.slice(),
        dataLabels: {
          enabled: false,
        },
        color: this.earlierYearColor,
      },
      {
        type: 'column', 
        name: laterYear.toString(),
        data: laterYearData.slice(),
        dataLabels: [{
          enabled: true,
          inside: true,
          style: {
            fontSize: '14px',
            color: 'white'
          }
        }],
        color: this.laterYearColor,
      },
      {
        type: 'line', // Add a line series for the mean
        name: `Mean of ${laterYear}`,
        data: meanDataArray,
        color: this.meanColor, // Choose the color you prefer
        marker: {
          enabled: false // Disable markers on the line
        }
      },
    ];
  
    this.updateFlag = true;
  }
  
  
  getData(data: any, year: number): any[] {
    return data.map((point: any[]) => ({
      name: `${point[0]} ${year}`,
      y: point[1],
    }));
  }

  
  
  
}