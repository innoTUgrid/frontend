import { Component, Input, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { Props } from 'src/app/types/props';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import { KpiService } from 'src/app/services/kpi.service';
import { TimeSeriesDataDictionary } from 'src/app/types/time-series-data.model';
import { KPIs } from 'src/app/types/kpi.model';

@Component({
  selector: 'app-energy-consumption-diagram',
  templateUrl: './energy-consumption-diagram.component.html',
  styleUrls: ['./energy-consumption-diagram.component.scss']

})
export class EnergyConsumptionDiagramComponent {
  Highcharts: typeof Highcharts = Highcharts; // required
  kpiService: KpiService = inject(KpiService);
  @Input() props: Props = {value: 75};

  chart: Highcharts.Chart|undefined

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
    this.kpiService.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const energy = data.get(KPIs.ENERGY_CONSUMPTION)
      if (!energy) {
        return
      }

      const series: Array<Highcharts.SeriesColumnOptions> = []
      const energyTypes = new Set(energy.map(entry => entry.meta.type))
      for (const type of energyTypes) {
        const typeData = energy.filter(entry => entry.meta.type === type)
        series.push({
          name: type,
          id: type, 
          data:typeData.map(entry => ([entry.time.getTime(), entry.value])),
          type: 'column'
        })
      }
      if (this.chart) {
        this.chart.update({
          series: series
        })
      } else {
        this.chartProperties.series = series
        this.updateFlag = true
      }
    });

    this.kpiService.timeInterval$$.subscribe((timeInterval) => {
      if (this.chart) {
        this.chart.xAxis[0].setExtremes(timeInterval.start.getTime(), timeInterval.end.getTime(), false);
        this.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        this.chart.axes[0].setDataGrouping(this.dataGrouping, true)
        // update also data grouping depending of timeInterval.step and timeInterval.stepUnit
      } else {
        this.xAxis.min = timeInterval.start.getTime();
        this.xAxis.max = timeInterval.end.getTime();
        this.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        this.updateFlag = true
      }
    });
  }

  constructor() {
    HC_exporting(Highcharts);
    HC_exportData(Highcharts);
  }

}
