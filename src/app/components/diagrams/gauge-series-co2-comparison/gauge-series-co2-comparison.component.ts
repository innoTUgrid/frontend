import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display';
import HC_more from 'highcharts/highcharts-more'; 
import { Options } from 'highcharts';
import HC_solidGauge from 'highcharts/modules/solid-gauge';

//import customPlugin from './customPlugin';

@Component({
  selector: 'app-gauge-series-co2-comparison',
  templateUrl: './gauge-series-co2-comparison.component.html',
  styleUrls: ['./gauge-series-co2-comparison.component.scss']
})
export class GaugeSeriesCo2ComparisonComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Options = {};
  updateFlag = false;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
   
  }

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
    HC_noData(Highcharts);
    HC_more(Highcharts);
    HC_solidGauge(Highcharts);
    //customPlugin(Highcharts)
  }

  ngOnInit(): void {
    this.setChartData();
  }

  setChartData(): void {
    const comparisonValue = 120;

    this.chartOptions = {
      chart: {
        styledMode: false,
        type: 'gauge',
        style: {
          fontFamily: 'Lucida Grande, sans-serif',
          fontSize: '1em',
        },
      },
      title: {
        text: 'Percentage Comparison of the Change in CO₂ Emissions',
        margin: 20,
        style: {
          fontSize: '0.95em',
        }
      },
      credits: {
        enabled: false
      },
      pane: {
        center: ['50%', '85%'],
        size: '100%',
        startAngle: -90,
        endAngle: 90,
        background: undefined
      },
      yAxis: {
        min: 0,
        max: 200,
        tickPixelInterval: 72,
        tickInterval: 25,
        tickPosition: 'inside',
        tickColor: 'red',
        tickLength: 25,
        tickWidth: 2,
        minorTickInterval: null,
        labels: {
          distance: 25,
          useHTML: true,
          formatter() {
            let color = '#DF5353';
            let valueNumber = +this.value;
            if (valueNumber < 75) {
              color = '#55BF3B';
            } else if (valueNumber >= 75 && valueNumber <= 125) {
              color = '#F8961E';
            }
  
            return `<span style='font-family:"Lucida Grande, sans-serif"; font-size: 1.2em; font-weight: bold; color: ${color}'>${this.value} %</span>`;
          },
        },
        plotBands: [
          {
            color: '#55BF3B', // green
            from: 0,
            to: 75,
            thickness: 20,
          },
          {
            from: 76,
            to: 125,
            color: '#F8961E', // yellow
            thickness: 20,
          },
          {
            from: 126,
            to: 200,
            color: '#DF5353', // red
            thickness: 20,
          },
        ],
      },
      series: [{
        type: 'gauge',
        name: 'CO₂ Emissions',
        data: [comparisonValue],
        tooltip: {
          valueSuffix: ' %'
        },
        dataLabels: {
          format: '{y} %',
          borderWidth: 0,
          color: (
            Highcharts.defaultOptions.title?.style?.color ?? '#FFFFFF'
          ),
          style: {
            fontSize: '16px'
          }
        },
        dial: {
          radius: '80%',
          backgroundColor: 'gray',
          baseWidth: 4,
          baseLength: '0%',
          rearLength: '0%',
          pivot: {
            backgroundColor: 'gray',
            radius: 6
          }
        } as any
      }]
    };

    this.updateFlag = true;
  }
}
