import { Injectable, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { TimeInterval, Series, TimeSeriesDataDictionary, Dataset } from '@app/types/time-series-data.model';
import { DataService } from './data.service';
import { DatasetKey, HighchartsDiagram, SingleValueDiagram, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Subscription } from 'rxjs';
import { sumAllDataTypes } from './data-utils';

function array2DEquals(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false
  }
  return true
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  themeService: ThemeService = inject(ThemeService);
  dataService: DataService = inject(DataService);

  constructor() { }

  updateSeries(diagram: HighchartsDiagram, dataset?: Dataset, onSeriesUpdate: () => void = () => {}) {
    if (!dataset) {
      return
    }
    const data = dataset.series

    const allSeries = []
    for (const [index, series] of data.entries()) {
      const newSeries: Highcharts.SeriesOptionsType = {
          name: series.name,
          id: series.id, 
          data:series.data,
          type: diagram.seriesType,
          color: series.color,
          animation: true,
          marker:{
            lineColor: series.color,
          },
          xAxis: (series.xAxis) ? series.xAxis : 0,
          pointPlacement: (series.pointPlacement) ? series.pointPlacement : undefined,
          dataGrouping: diagram.dataGrouping,
          index: index
        }

      allSeries.push(newSeries)
    }

    diagram.chartProperties.series = allSeries
    if (diagram.chart) {
      diagram.chart.update({
        series: allSeries
      }, true, true)
    } else {
      diagram.chartProperties.series = allSeries
      diagram.updateFlag = true
    }

    if (onSeriesUpdate) {
      onSeriesUpdate()
    }
  }

  filterOtherStepUnits(data: Series[]): Series[] {
    const currentTimeInterval = this.dataService.getCurrentTimeInterval()
    return data.filter((series) => series.timeUnit === currentTimeInterval.stepUnit)
  }

  subscribeLoading(diagram: {chart:{hideLoading: () => void, showLoading: () => void} | undefined}, datasetKey: DatasetKey): Subscription {
    return this.dataService.loadingDatasets.subscribe((loading: DatasetKey[]) => {
      if (diagram.chart) {
        if (loading.indexOf(datasetKey as DatasetKey) === -1 ) diagram.chart.hideLoading()
        else diagram.chart.showLoading()
      }
    })
  }

  subscribeSeries(
    diagram: HighchartsDiagram, 
    datasetKey: string, 
    beforeProcessData: (dataset: Series[]) => Series[] = this.filterOtherStepUnits.bind(this),
    onSeriesUpdate?: () => void,
  ): Subscription[] {
    if (diagram.chart) {
      diagram.chart.update({series: []}, false, true)
    }
    const s1 = this.dataService.getDataset(datasetKey).subscribe((dataset: Dataset) => {
      const updatedSeries = beforeProcessData(dataset.series)
      this.updateSeries(diagram, {...dataset,
        series: updatedSeries,
      }, onSeriesUpdate)
    });

    const s2 = this.subscribeLoading(diagram, datasetKey as DatasetKey)

    return [s1, s2]
  }

  updateInterval(diagram: HighchartsDiagram, timeIntervals: TimeInterval[], redraw: boolean) {
    for (const [index, timeInterval] of timeIntervals.entries()) {
      if (index >= diagram.xAxis.length) break
      if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.chart.axes[index].setDataGrouping(diagram.dataGrouping, false)
        diagram.chart.xAxis[index].setExtremes(timeInterval.start.valueOf(), timeInterval.end.valueOf(), false, false);
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.xAxis[index].min = timeInterval.start.valueOf();
        diagram.xAxis[index].max = timeInterval.end.valueOf();
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
      }
    }
    if (timeIntervals.length > 0 && redraw) {
      if (diagram.chart) {
        diagram.chart.redraw()
      } else diagram.updateFlag = true
    }
  }

  subscribeInterval(diagram: HighchartsDiagram, redraw: boolean= true): Subscription {
    const s = this.dataService.timeInterval.subscribe((timeIntervals: TimeInterval[]) => {
      this.updateInterval(diagram, timeIntervals, redraw)
    });
    return s
  }

  calculateSingleValue(data: number[][], average: boolean = true): number {
    let sum = 0
    for (const datapoint of data) {
        sum += datapoint[1]
    }
    if (average && data.length > 0) sum /= data.length
    return sum
  }

  updateSingleValue(diagram: SingleValueDiagram, average: boolean = true, data: Series[], timeIntervals: TimeInterval[]) {
    const values = []
    for (const [index, timeInterval] of timeIntervals?.entries()) {
      const series = sumAllDataTypes(data, timeInterval)
      const newValue = this.calculateSingleValue(series, average)
      values.push(newValue)
    }

    if (Array.isArray(diagram.value)) {
      diagram.value = values
    } else {
      diagram.value = (values.length > 0) ? values[0] : 0
    }
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, datasetKey:DatasetKey, average: boolean = true) {
    const s1 = this.dataService.getDataset(datasetKey).subscribe((dataset:Dataset) => {
      this.updateSingleValue(diagram, average, dataset.series, this.dataService.timeInterval.getValue())
    });

    const s2 = this.subscribeLoading({
      chart: {
        showLoading: () => {
          diagram.loading = true
          if (diagram.chart) diagram.chart.showLoading()
        },
        hideLoading: () => {
          diagram.loading = false
          if (diagram.chart) diagram.chart.hideLoading()
        }
      }
    }, datasetKey as DatasetKey)

    return [s1, s2]
  }

  updateAverageLine(chart: Highcharts.Chart, stacked:boolean, seriesIndex: number = 0, unit: string = '') {
    const series = chart.series[seriesIndex] as any
    if (!series) {
      console.error(`chart has no series with index ${seriesIndex}, when trying to add average line`)
      return
    }

    const groupedData = series.groupedData
    
    const plotLineId = 'average ' + seriesIndex.toString()
    if (groupedData) {
      let sum = 0
      for (const group of groupedData) {
        if (stacked) {
          sum += group.stackTotal
        } else {
          sum += group.y
        }
      }
      sum /= groupedData.length
      
      const averageLine: Highcharts.SeriesLineOptions = {
        type: 'line',
        name: 'Average',
        id: plotLineId,
        data: [
          {
            x: groupedData[0].x,
            y: sum,
          },
          {
            x: chart.xAxis[0].max || groupedData[groupedData.length - 1].x,
            y: sum,
            dataLabels: {
              enabled: true,
              formatter: function() {
                return `Average: ${sum.toFixed(2)} ${unit}`
              }
            }
          }
        ],
        color: 'var(--highcharts-neutral-color-40)',
        zIndex: 5,
        marker: {
          enabled: false
        },
        enableMouseTracking: false,
        dataGrouping: {
          enabled: false
        },
        tooltip: {
          pointFormat: 'Average: <b>{point.y:,.0f}</b><br/>',
        },
      }
      chart.addSeries(averageLine, true, true)
    }
  }

  static addThousandsSeparator(x: string | number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
