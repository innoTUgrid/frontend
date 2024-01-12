import { Injectable, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { TimeInterval, Series, TimeSeriesDataDictionary, Dataset } from '@app/types/time-series-data.model';
import { DataService } from './data.service';
import { DatasetKey, HighchartsDiagram, SingleValueDiagram } from '@app/types/kpi.model';
import { Subscription } from 'rxjs';
import { Series as HighchartsSeries } from 'highcharts';

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
    let hasChanged = false
    for (const series of data) {
      const color = (series.color) ? series.color : this.themeService.colorMap.get(series.type)

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

      if (diagram.chart) {
        const chartSeries = diagram.chart.get(series.id) as HighchartsSeries
        if (chartSeries) {
          const currentSeries: any = diagram.chartProperties.series?.find((s) => s.id === series.id)
          if (currentSeries && currentSeries.data !== series.data) {
            chartSeries.update(newSeries, false)
            hasChanged = true
          }
        } else {
          diagram.chart.addSeries(newSeries, true, false)
          hasChanged = true
        }
      }
    }
    diagram.chartProperties.series = allSeries
    if (diagram.chart) {
      diagram.chart.hideLoading()
      if (hasChanged) diagram.chart.redraw()
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
    const s = this.dataService.getDataset(datasetKey).subscribe((dataset: Dataset) => {
      const updatedSeries = beforeProcessData(dataset.series)
      this.updateSeries(diagram, datasetKey, {
        series: updatedSeries,
        lastCall: dataset.lastCall,
      })
    });
    return s
  }

  subscribeInterval(diagram: HighchartsDiagram): Subscription {
    const s = this.dataService.timeInterval.subscribe((timeIntervals: TimeInterval[]) => {
      // iterate over timeInetrvals with index
      for (const [index, timeInterval] of timeIntervals.entries()) {
        if (index >= diagram.xAxis.length) break
        if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
          diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
          diagram.chart.axes[index].setDataGrouping(diagram.dataGrouping, false)
          diagram.chart.xAxis[index].setExtremes(timeInterval.start.valueOf(), timeInterval.end.valueOf(), false, true);
        } else { // this is only reachable for code that uses highcharts-angular
          diagram.xAxis[index].min = timeInterval.start.valueOf();
          diagram.xAxis[index].max = timeInterval.end.valueOf();
          diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
          diagram.updateFlag = false
        }
      }
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

  updateSingleValue(diagram: SingleValueDiagram, average: boolean = true, data?: Series[]) {
      if (!data) {
        return
      }

      if (data.length > 1) console.error(`SingleValueDiagram can only display one series, but got ${data.length}`)
      const series = data.map(entry => entry.data).flat()
      diagram.value = this.calculateSingleValue(series, average)
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, datasetKey:DatasetKey, average: boolean = true) {
    const s1 = this.dataService.getDataset(datasetKey).subscribe((dataset:Dataset) => {
      this.updateSingleValue(diagram, average, dataset.series)
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


  updateAverageLine(chart: Highcharts.Chart, stacked:boolean) {
    const seriesIndex = 0

    const series = chart.series[seriesIndex] as any
    const groupedData = series.groupedData
    
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
        id: 'average ' + seriesIndex.toString(),
        width: 2,
        value: sum,
        zIndex: 5,
      }
      chart.yAxis[0].addPlotLine(plotLines)
    }
  }
}
