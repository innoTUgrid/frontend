import { Component, Input, inject } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import { Props } from 'src/app/types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-production-consumption-diagram',
  templateUrl: './production-consumption-diagram.component.html',
  styleUrls: ['./production-consumption-diagram.component.scss']

})
export class ProductionConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);
  production: number[] = []
  consumption: number[] = []

  chart: Highcharts.Chart|undefined

  Highcharts: typeof Highcharts = Highcharts; // required

  days = ["Mon", "Tue", "Wed", "Th", "Fri", "Sat", "Sun"]
  // 4 hourly
  hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]
  
  interval = "day"
  updateFlag = false

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
    this.updateInterval(this.interval)
  }

  xAxis: Highcharts.XAxisOptions = {
    categories: this.hours,
    crosshair: true,
    accessibility: {
      description: 'Days of the week'
    }
  }

  updateInterval(interval: string) {
    this.interval = interval
    // use the update function
    if (this.chart) {
      this.xAxis.categories = this.interval == "day" ? this.hours : this.days
      this.chart?.update({
        xAxis: this.xAxis,
        series: [
          {
              name: 'Production',
              data: this.interval == "day" ? this.production : [406292, 260000, 107000, 68300, 27500, 14500, 15541],
              type: 'column'
          },
          {
              name: 'Consumption',
              data: this.interval == "day" ? this.consumption : [51086, 136000, 5500, 141000, 107180, 77000, 55551],
              type: 'column'
          }
        ]
      }, true, true, true)
      console.log("updating interval")
    }
  }


  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
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

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    this.kpiService.consumptionData$.subscribe((consumption) => {
      this.consumption = consumption;
    });

    this.kpiService.consumptionData$.subscribe((production) => {
      this.production = production;
    });

    // Trigger the computation of autarkyKPI (for later)
    this.kpiService.computeConsumptionData();
    this.kpiService.computeProductionData();
  }

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
  }

}
