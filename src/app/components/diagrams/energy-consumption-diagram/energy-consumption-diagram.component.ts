import { Component, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DatasetKey, HighchartsDiagram, SeriesTypes, TimeSeriesKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/services/chart.service';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent implements HighchartsDiagram {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartService: ChartService = inject(ChartService);
  kpiName?: DatasetKey = TimeSeriesKey.ENERGY_CONSUMPTION;
  subscriptions: Subscription[] = [];

  chart: Highcharts.Chart|undefined
  seriesType: SeriesTypes = 'column';

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
    this.subscriptions = this.chartService.subscribeSeries(this, true);
  }

}
