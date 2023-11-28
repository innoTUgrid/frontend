import { Component, Input, ViewChild, inject } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import { Props } from 'src/app/types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);
  series: any = []

  chart: Highcharts.Chart|undefined

  Highcharts: typeof Highcharts = Highcharts; // required

  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  // 4 hourly
  hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]
  
  interval = "week"
  updateFlag = false

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
    // this.updateInterval(this.interval)
  }


  updateInterval(interval: string) {
    this.interval = interval
    // use the update function
    if (this.chart) {
      const productionDataSeries = [406292, 260000, 107000, 68300, 27500, 14500, 15541]
      const consumptionDataSeries = [51086, 136000, 5500, 141000, 107180, 77000, 55551]
      this.chart?.update({
        xAxis: {
          id: 'xAxis', // update xAxis and do not create a new one
          categories: this.interval === "day" ? this.hours : this.days,
          accessibility: {
            description: this.interval === "day" ? '4 hourly' : 'Days of the week'
          },
        },
        series: [
          {
            id: 'production-series',
            name: 'Production',
            data: productionDataSeries,
            type: 'column'
          },
          {
            id: 'consumption-series',
            name: 'Consumption',
            data: consumptionDataSeries,
            type: 'column'
          }
        ],
      }, true, true, true)

      
    }
  }


  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Consumed Electricity by Source',
      margin: 50
    },
    credits: {
      enabled: false
    },
    xAxis: {
      id: 'xAxis', // update xAxis and do not create a new one
      categories: this.interval === "day" ? this.hours : this.days,
      accessibility: {
        description: this.interval === "day" ? '4 hourly' : 'Days of the week'
      },
    },
    yAxis: {
      min: 0,
      title: {
          text: 'Consumption (kWh)'
      }
    },
    tooltip: {
      valueSuffix: ' ppm'
    },
    exporting: {
      enabled: true,
    },
    plotOptions: {
      column: {
          stacking: 'normal',
          dataLabels: {
              enabled: true
          }
      }
    },
    series: [{
        name: 'Solar Local',
        data: [3, 5, 1, 13, 2, 8, 9],
        type: 'column'
    }, {
        name: 'Biogas Local',
        data: [14, 8, 8, 12, 3, 4, 7],
        type: 'column'
    }, {
        name: 'Others',
        data: [0, 2, 6, 3, 2, 2, 1],
        type: 'column'
    }]
  }

  ngOnInit(): void {
    // filter for the data that has the key energyConsumption in the dictionary
    // then map the values of the data to an array
    this.kpiService.timeSeriesDataFiltered$.subscribe((data) => {
      const energy = (data.get('energyConsumption') || []) 

      this.series = []
      const energyTypes = new Set(energy.map(entry => entry.meta.type))
      for (const type of energyTypes) {
        const typeData = energy.filter(entry => entry.meta.type === type)
        this.series.push({"name":type, "data":typeData.map(entry => entry.value)})
      }
      this.updateFlag = true
    });
  }

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
  }

}
