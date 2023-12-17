import { Component, Input, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display'
import { KpiService } from 'src/app/services/kpi.service';
import { TimeSeriesDataDictionary } from 'src/app/types/time-series-data.model';
import { KPI, HighchartsDiagram, SeriesTypes } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent implements HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  kpiService: KpiService = inject(KpiService);
  kpiName?: KPI = KPI.ENERGY_CONSUMPTION;
  subscriptions: Subscription[] = [];

  chart: Highcharts.Chart|undefined
  seriesType: SeriesTypes = 'column';
  colors: string[] = []

  updateFlag = false

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
    this.updateAverageLine()
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

  plotLines: Highcharts.YAxisPlotLinesOptions = {
    width: 2,
    value: 0,
    zIndex: 5,
    
  }

  chartProperties: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Consumed Electricity by Source',
      style: {
        fontSize: '1em',
      }
    },
    credits: {
      enabled: false
    },
    xAxis: this.xAxis,
    yAxis: {
      min: 0,
      title: {
        text: 'Consumption (kWh)'
      },
    },
    tooltip: {
      valueSuffix: ' kWh',
      valueDecimals: 2,
    },
    exporting: {
      enabled: true,
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false
        },

        dataGrouping: this.dataGrouping,
      }
    },
  }

  updateAverageLine() {
    if (this.chart && this.chart.series && this.chart.series[0]) {
      const series = this.chart.series[0] as any
      const groupedData = series.groupedData
      if (groupedData) {
        let sum = 0
        for (const group of groupedData) {
          sum += group.stackTotal
        }
        sum /= groupedData.length
        this.plotLines.value = sum
        this.chart.update({
          yAxis: {
            color: '#FF0000',
            plotLines: [this.plotLines]
          }
        }, true, true, true)
      }
    }
  }

  onSeriesUpdate() {
    this.updateAverageLine()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  
  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
    HC_noData(Highcharts);
    this.subscriptions = this.kpiService.subscribeSeries(this);
  }

}
