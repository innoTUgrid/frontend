import { Injectable, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { TimeInterval, Series, TimeSeriesDataDictionary, Dataset } from '@app/types/time-series-data.model';
import { DataService } from './data.service';
import { DatasetKey, HighchartsDiagram, SingleValueDiagram, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Subscription } from 'rxjs';
import { Series as HighchartsSeries } from 'highcharts';
import { DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/cdk/dialog';

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

  updateSeries(diagram: HighchartsDiagram, datasetKey: string, dataset?: Dataset) {
    if (!dataset) {
      return
    }
    const data = dataset.series

    const allSeries = []
    let updateSeries: boolean = false
    for (const series of data) {
      const color = (series.color) ? series.color : this.themeService.colorMap.get(series.type)

      // series.data.sort((a, b) => a[0] - b[0])
      const newSeries: Highcharts.SeriesOptionsType = {
          name: series.name,
          id: series.id, 
          data:series.data,
          type: diagram.seriesType,
          color: color,
          animation: true,
          marker:{
            lineColor: color,
          },
          xAxis: (series.xAxis) ? series.xAxis : 0,
          pointPlacement: (series.pointPlacement) ? series.pointPlacement : undefined,
        }

      allSeries.push(newSeries)
    }

    diagram.chartProperties.series = allSeries
    if (diagram.chart) {
      diagram.chart.hideLoading()
      diagram.chart.update({
        series: allSeries
      }, true, true)
    } else {
      diagram.chartProperties.series = allSeries
      diagram.updateFlag = true
    }
    if (diagram.onSeriesUpdate) {
      diagram.onSeriesUpdate()
    }
  }

  filterOtherStepUnits(data: Series[]): Series[] {
    const currentTimeInterval = this.dataService.getCurrentTimeInterval()
    return data.filter((series) => series.timeUnit === currentTimeInterval.stepUnit)
  }

  subscribeSeries(
    diagram: HighchartsDiagram, 
    datasetKey: string, 
    beforeProcessData: (dataset: Series[]) => Series[] = this.filterOtherStepUnits.bind(this),
  ): Subscription {
    if (diagram.chart) {
      diagram.chart.update({series: []}, false, true)
    }
    const s = this.dataService.getDataset(datasetKey).subscribe((dataset: Dataset) => {
      const updatedSeries = beforeProcessData(dataset.series)
      this.updateSeries(diagram, datasetKey, {...dataset,
        series: updatedSeries,
      })
    });
    return s
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
        diagram.updateFlag = false
      }
      if (timeIntervals.length > 0 && diagram.chart && redraw) diagram.chart.redraw()
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
      const series = this.sumAllDataTypes(data, timeInterval)
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

    return [s1]
  }

  sumAllDataTypes(data: Series[], interval?: TimeInterval): number[][] {
    let relevantSeries: Series[] = data
    if (interval) relevantSeries = data.filter(series => series.timeUnit === interval.stepUnit)

    const dataMap = new Map<number, number>()
    for (const series of relevantSeries) {
      let i = 0;
      const data_len = series.data.length

      while (i < data_len) { // using this type of loop for performance reasons
        const point = series.data[i]
        if (!interval || (point[0] >= interval.start.valueOf() && point[0] <= interval.end.valueOf())) {
          const value = dataMap.get(point[0])
          if (value) {
            dataMap.set(point[0], value + point[1])
          } else {
            dataMap.set(point[0], point[1])
          }
        }

        i++;
      }
    }

    const newDatapoints = Array.from(dataMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => [entry[0], entry[1]])
    return newDatapoints
  }


  updateAverageLine(chart: Highcharts.Chart, stacked:boolean, seriesIndex: number = 0) {
    const series = chart.series[seriesIndex] as any
    const groupedData = series.groupedData
    
    const plotLineId = 'average ' + seriesIndex.toString()
    chart.yAxis[0].removePlotLine(plotLineId)

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

      const plotLines: Highcharts.YAxisPlotLinesOptions = {
        id: plotLineId,
        width: 2,
        value: sum,
        zIndex: 5,
      }
      chart.yAxis[0].addPlotLine(plotLines)
    }
  }

  static addThousandsSeparator(x: string | number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
