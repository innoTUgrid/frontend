import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DataService } from '@app/services/data.service';
import { Subscription } from 'rxjs';
import { DataEvents, Dataset, DatasetRegistry, EndpointUpdateEvent } from '@app/types/time-series-data.model';
import { DatasetKey, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { sumAllDataTypes, toDatasetTotal } from '@app/services/data-utils';
import { ChartService } from '@app/services/chart.service';

@Component({
  selector: 'app-emissions-by-scope',
  templateUrl: './emissions-by-scope.component.html',
  styleUrls: ['./emissions-by-scope.component.scss']
})
export class EmissionsByScopeComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  dataService: DataService = inject(DataService);
  chartService: ChartService = inject(ChartService);
  id = "EmissionsByScope." + Math.random().toString(36).substring(7);

  chart: Highcharts.Chart | undefined;
  updateFlag = false;

  _timeIntervalIndex: number = 0


  get timeIntervalIndex(): number {
    return this._timeIntervalIndex
  }

  set timeIntervalIndex(value: number) {
    this._timeIntervalIndex = value
    this.updateButtonText()
    this.updateData()
  }

  scopeEndpoints = [TimeSeriesEndpointKey.SCOPE_1_EMISSIONS, TimeSeriesEndpointKey.SCOPE_2_EMISSIONS]
 
  
  registry: DatasetRegistry = { id: this.id, endpointKey: TimeSeriesEndpointKey.ALL_SCOPE_EMISSIONS_COMBINED }

  subscriptions: Subscription[] = [];


  value: number[] = [0, 0]

  get series(): Highcharts.SeriesOptionsType[] {

    if (this.value.length < 2) return []
    return [
      {
        id: 'emissions-by-scope',
        name: 'Emissions',
        colorByPoint: true,
        data: [
          {
            name: 'Scope 1',
            y: this.value[0],
            colorIndex: 'var(--highcharts-color-4)',
            color: 'var(--highcharts-color-4)',
          },
          {
            name: 'Scope 2',
            y: this.value[1],
            colorIndex: 'var(--highcharts-color-0)',
            color: 'var(--highcharts-color-0)',
          },
        ],
        type: 'pie',
      } as any,
    ]
  } 

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chart = chart;
    this.updateButtonText()
  }

  toggleInterval: Highcharts.ExportingButtonsOptionsObject = {
    onclick: () => {
      this.timeIntervalIndex = (this.timeIntervalIndex + 1) % 2
    }
  }

  updateButtonText() {
    this.toggleInterval.text = (this.timeIntervalIndex === 1) ? 'Show Baseline Year' : 'Show Comparison Year'
    this.chart?.update({
      exporting: {
        buttons: {
          toggleInterval: this.toggleInterval,
        }
      }
    }, true, true, true)
  }

  pieChartProperties: Highcharts.Options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: 'CO₂ Emissions by Scope',
    },
    tooltip: {
      useHTML: true,
      pointFormatter: function () {
        const point = this as Highcharts.Point & { trend: string };
        const color = point.color || 'black';
        const formattedY = (point.y ?? 0).toLocaleString('de-DE');
        return `

          <b style="color: ${color};">Emissions</b>: 
          <b>${formattedY} kg</b>
        `;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false, 
        },
        showInLegend: true, 
      },
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: {
        fontWeight: 'normal',
      },
      itemWidth: 250, 
      labelFormatter: function () {
        const point = this as Highcharts.Point & { trend: string }; 
        
        const trend = point.trend;
        const color = point.color || 'black'; 

        const formattedY = (point.y ?? 0).toLocaleString('de-DE');
        const formattedPercentage = point.percentage?.toFixed(2) ?? '0';

        return `
          <b>${point.name}</b>:&nbsp;&nbsp;
          <span style="color: ${color};">${formattedY} kg</span>
          &nbsp;
          <span>${formattedPercentage}%</span>
        `;
      },
    },
    
    series: this.series,

    exporting: {
      buttons: {
        toggleInterval: this.toggleInterval,
      }
    }
  };
  

  constructor() {
  }

  updateData() {
    const timeIntervals = this.dataService.timeInterval.getValue()
    const dataset = this.dataService.getDataset(this.registry.endpointKey).getValue()
    for (const [index, scopeId] of this.scopeEndpoints.entries()) {
      const series = dataset.series.filter(s => s.sourceDataset === scopeId)
      const data = sumAllDataTypes(series, timeIntervals[this.timeIntervalIndex])
  
      const newValue = this.chartService.calculateSingleValue(data, false)
      this.value[index] = newValue
    }

    const year = timeIntervals[this.timeIntervalIndex].start.year().toString()
    this.pieChartProperties.subtitle = {
      text: (this.timeIntervalIndex === 0) ? `Baseline Year (${year})` : `Comparison Year (${year})`
    }
    if (this.chart) {
      this.chart.update({
        series: this.series,
        subtitle: this.pieChartProperties.subtitle
      }, true, true, true)
    } else {
      this.updateFlag = true
    }
  }

  ngOnInit() {
    this.subscriptions.push(this.dataService.loadingDatasets.subscribe((loading: DatasetKey[]) => {
      if (this.chart) {
        if (loading.indexOf(this.registry.endpointKey) === -1 ) this.chart.hideLoading()
        else this.chart.showLoading()
      }
    }))

    this.dataService.registerDataset(this.registry)
    this.subscriptions.push(
      this.dataService.getDataset(this.registry.endpointKey).subscribe((dataset: Dataset) => {
        this.updateData()
      })
    )
  }

  ngOnDestroy() {
    this.dataService.unregisterDataset(this.registry)
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
  }
}
