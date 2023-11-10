import { Component, Input } from '@angular/core';
import { Props } from '../../types/props';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';

@Component({
  selector: 'app-production-consumption-diagram',
  template: `
  <mat-card-content>
    <highcharts-chart
      [Highcharts]="Highcharts"
      [options]="chartProperties"
      [(update)]="updateFlag"
      style="display: block;"
    ></highcharts-chart>
  </mat-card-content>
  `,
  styleUrls: ['./production-consumption-diagram.component.scss']

})
export class ProductionConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};

  Highcharts: typeof Highcharts = Highcharts; // required

  days = ["Mon", "Tue", "Wed", "Th", "Fri", "Sat", "Sun"]
  // 4 hourly
  hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]
  
  interval = "day"
  updateFlag = false

  updateInterval(interval: string) {
    this.interval = interval
    // use the update function
    this.xAxis.categories = this.interval == "day" ? this.hours : this.days
    this.updateFlag = true
  }

  xAxis: Highcharts.XAxisOptions = {
    categories: this.hours,
    crosshair: true,
    accessibility: {
      description: 'Days of the week'
    } 
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
      events: {

      }
    },
    title: {
      text: 'Production and Consumption',
      margin: 50
    },
    credits: {
      enabled: false
    },
    yAxis: {
      min: 0,
      title: {
          text: 'C0\u2082 Emissions (kg)'
      }
    },
    tooltip: {
      valueSuffix: ' ppm'
    },
    xAxis: this.xAxis,
    series: [
      {
          name: 'Production',
          data: [406292, 260000, 107000, 68300, 27500, 14500, 15541],
          type: 'column'
      },
      {
          name: 'Consumption',
          data: [51086, 136000, 5500, 141000, 107180, 77000, 55551],
          type: 'column'
      }
    ],
    exporting: {
      enabled: true,
      buttons: {
        customButton1: {
          text: 'Week',
          onclick: () => {
            this.updateInterval("week")
          },
          y: 30,
        },
        customButton2: {
          text: 'Day',
          useHTML: true,
          onclick: () => {
            this.updateInterval("day")
          },
          y: 27,
        }
      }
      
    }
  }

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
  }

}
