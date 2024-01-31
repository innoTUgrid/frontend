import { Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { DataService } from '@app/services/data.service';
import { Subscription } from 'rxjs';
import { Dataset, DatasetRegistry } from '@app/types/time-series-data.model';
import { TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { sumAllDataTypes, toDatasetTotal } from '@app/services/data-utils';
import { ChartService } from '@app/services/chart.service';


const upwardTrendIcon = '<span style="color: var(--highcharts-color-15)">↑</span>'
const downwardTrendIcon = '<span style="color: var(--highcharts-color-0)">↓</span>'

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
    this.updateData([0,1])
  }
 
  
  registries: DatasetRegistry[] = [
    { id: this.id, endpointKey: TimeSeriesEndpointKey.SCOPE_1_EMISSIONS },
    { id: this.id, endpointKey: TimeSeriesEndpointKey.SCOPE_2_EMISSIONS }
  ]

  subscriptions: Subscription[] = [];


  upwardTrend: boolean[] = [false, false]
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
            trend: (this.upwardTrend[0]) ? upwardTrendIcon : downwardTrendIcon,
          },
          {
            name: 'Scope 2',
            y: this.value[1],
            colorIndex: 'var(--highcharts-color-0)',
            color: 'var(--highcharts-color-0)',
            trend: (this.upwardTrend[1]) ? upwardTrendIcon : downwardTrendIcon, 
          },
        ],
        type: 'pie',
      } as any,
    ]
  } 

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    if (!chart.series) chart.showLoading()
    this.chart = chart;
  }

  toggleInterval: Highcharts.ExportingButtonsOptionsObject = {
    onclick: () => {
      this.timeIntervalIndex = (this.timeIntervalIndex + 1) % 2
    }
  }

  updateButtonText() {
    this.toggleInterval.text = (this.timeIntervalIndex === 0) ? 'Show BaselineYear' : 'Show Comparision Year'
    this.chart?.update({
      exporting: {
        buttons: {
          toggleInterval: this.toggleInterval,
        }
      }
    }, false, true, true)
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
          &nbsp;${trend}&nbsp;
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

  updateData(registryIndices: number|number[]) {
    if (!Array.isArray(registryIndices)) {
      registryIndices = [registryIndices]
    }

    for (const registryIndex of registryIndices) {
      const registry = this.registries[registryIndex]
      const dataset = this.dataService.getDataset(registry.endpointKey).getValue()
      const timeIntervals = this.dataService.timeInterval.getValue()
      const data = sumAllDataTypes(dataset.series, timeIntervals[this.timeIntervalIndex])
      const diff = data[data.length - 1][1] - data[0][1]
      this.upwardTrend[registryIndex] = (diff > 0) ? true : false
  
      const newValue = this.chartService.calculateSingleValue(data, false)
      this.value[registryIndex] = newValue
    }

    if (this.chart) {
      this.chart.update({
        series: this.series,
      }, true, true, true)
    } else {
      this.updateFlag = true
    }
  }

  ngOnInit() {
    this.updateButtonText()
    for (const [index, registry] of this.registries.entries()) {
      this.dataService.registerDataset(registry)

      this.subscriptions.push(
        this.dataService.getDataset(registry.endpointKey).subscribe((dataset: Dataset) => {
          this.updateData(index)
        })
      )
    }

  }

  ngOnDestroy() {
    this.registries.forEach((registry) => this.dataService.unregisterDataset(registry))
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
  }
}
