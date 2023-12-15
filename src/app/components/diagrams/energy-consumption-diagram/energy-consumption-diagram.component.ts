import { Component, Input, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { Props } from 'src/app/types/props';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display'
import { KpiService } from 'src/app/services/kpi.service';
import { TimeSeriesDataDictionary } from 'src/app/types/time-series-data.model';
import { KPI, HighchartsDiagram, SeriesTypes } from 'src/app/types/kpi.model';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent implements HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  kpiService: KpiService = inject(KpiService);
  @Input() props: Props = {value: 75};

  chart: Highcharts.Chart|undefined
  seriesType: SeriesTypes = 'column';
  colors: string[] = []

  updateFlag = false

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
  }


  xAxis: Highcharts.XAxisOptions = {
    id: 'xAxis', // update xAxis and do not create a new one
    // title: {text:'Time'},
    type: 'datetime',
    dateTimeLabelFormats: {
      minute: '%H:%M',
    },
  }

  dataGrouping: Highcharts.DataGroupingOptionsObject = {
    approximation: 'sum',
    enabled: true,
    forced: true,
    units: [['day', [1]]]
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
    xAxis: this.xAxis,
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
        },

        dataGrouping: this.dataGrouping,
      }
    },
  }

  ngOnInit(): void {
  }
  
  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
    HC_noData(Highcharts);
    this.kpiService.subscribeSeries(this, KPI.ENERGY_CONSUMPTION);
  }

}
