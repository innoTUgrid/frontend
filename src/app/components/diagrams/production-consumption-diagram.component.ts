import { Component, Input } from '@angular/core';
import { Props } from '../../types/props';
import { Options } from 'highcharts';
import * as Highcharts from 'highcharts';
@Component({
  selector: 'app-production-consumption-diagram',
  template: `
  <div class="prod-cons-diagram">
    <mat-button-toggle-group [value]="interval" (change)="intervalChanged($event)">
      <mat-button-toggle value="day">Day</mat-button-toggle>
      <mat-button-toggle value="week">Week</mat-button-toggle>
    </mat-button-toggle-group>
    <highcharts-chart
      [Highcharts]="Highcharts"
      [options]="chartProperties"
      [(update)]="updateFlag"
      style="width: 400px; height: 400px; display: block;"
    ></highcharts-chart>
  </div>
  `,
  styles: [`
  .prod-cons-diagram {
    width: 100%;
    height: 100%;
  }
  `]

})
export class ProductionConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};

  Highcharts: typeof Highcharts = Highcharts; // required

  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  // 4 hourly
  hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
  
  interval = "day"
  updateFlag = false

  intervalChanged(event: any) {
    this.interval = event.value
    this.xAxis.categories = this.interval == "day" ? this.days : this.hours
    this.updateFlag = true
  }

  xAxis: Highcharts.XAxisOptions = {
    categories: this.days,
    crosshair: true,
    accessibility: {
      description: 'Days of the week'
    } 
  }

  chartProperties: Options = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Production and Consumption'
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
          data: [406292, 260000, 107000, 68300, 27500, 14500],
          type: 'column'
      },
      {
          name: 'Consumption',
          data: [51086, 136000, 5500, 141000, 107180, 77000],
          type: 'column'
      }
  ]
  }

}
