import { Injectable, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { TimeInterval, TimeSeriesDataDictionary, TimeSeriesDataPoint } from '@app/types/time-series-data.model';
import { DataService } from './data.service';
import { HighchartsDiagram, SingleValueDiagram } from '@app/types/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  themeService: ThemeService = inject(ThemeService);
  dataService: DataService = inject(DataService);

  constructor() { }

  updateSeries(diagram: HighchartsDiagram, aggregateExternal: boolean = false, data?: TimeSeriesDataDictionary) {
    if (!data) data = this.dataService.timeSeriesData.getValue()

    let energy = diagram.kpiName? data.get(diagram.kpiName) : undefined
    if (!energy) {
      return
    }

    if (aggregateExternal) {
      const data = energy.filter(entry => !entry.local).map(entry => entry.data).flat()
      data.sort((a, b) => a.timestamp - b.timestamp)
      energy = [{
        name: 'Imported Energy',
        type: 'external',
        data: data,
      }, ...energy.filter(entry => entry.local)]
    }

    if (diagram.chart) {
      while(diagram.chart.series.length > 0) {
        diagram.chart.series[0].remove(false, false)
      }
    } else {
      diagram.chartProperties.series = []
    }

    for (const series of energy) {
      const color = this.themeService.colorMap.get(series.type)

      const data = series.data.map(entry => ([entry.timestamp, entry.value]))

      const newSeries = {
          name: series.name,
          id: series.type + ' ' + diagram.kpiName, 
          data:data,
          type: diagram.seriesType,
          color: color,
          animation: true,
          marker:{
            lineColor: color,
          },
        }
      if (diagram.chart) {
        diagram.chart?.addSeries(newSeries, false, true)
      } else {
        diagram.chartProperties.series?.push(newSeries)
      }
    }
    if (diagram.chart) {
      diagram.chart.redraw()
    } else { // this is only reachable for code that uses highcharts-angular
      diagram.updateFlag = true
    }
    if (diagram.onSeriesUpdate) {
      diagram.onSeriesUpdate()
    }
  }

  subscribeSeries(diagram: HighchartsDiagram, aggregateExternal: boolean = false) {
    const s1 = this.dataService.timeSeriesData.subscribe((data:TimeSeriesDataDictionary) => {
      this.updateSeries(diagram, aggregateExternal, data)
    });

    const s2 = this.dataService.timeInterval.subscribe((timeInterval: TimeInterval) => {
      const minuteFormat = '%H:%M'
      const dayFormat = '%e. %b'
      diagram.xAxis.dateTimeLabelFormats = {
        minute: minuteFormat,
        day: timeInterval.stepUnit === 'day' ? dayFormat : minuteFormat,
      }
      diagram.updateFlag = true

      if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.chart.axes[0].setDataGrouping(diagram.dataGrouping, false)
        diagram.chart.xAxis[0].setExtremes(timeInterval.start.toDate().getTime(), timeInterval.end.toDate().getTime(), true, true);
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.xAxis.min = timeInterval.start.toDate().getTime();
        diagram.xAxis.max = timeInterval.end.toDate().getTime();
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.updateFlag = true
      }
    });

    return [s1, s2]
  }

  calculateSingleValue(data: TimeSeriesDataPoint[], average: boolean = true): number {
    let sum = 0
      for (const datapoint of data) {
          sum += datapoint.value
      }
      if (average && data.length > 0) sum /= data.length
      return sum
  }

  updateSingleValue(diagram: SingleValueDiagram, average: boolean = true, data?: TimeSeriesDataDictionary) {
      if (!data) data = this.dataService.timeSeriesData.getValue()

      const kpiData = (diagram.kpiName) ? data.get(diagram.kpiName) : undefined
      if (!kpiData) {
        return
      }

      if (kpiData.length > 1) console.error(`SingleValueDiagram can only display one series, but got ${kpiData.length} at ${diagram.kpiName}`)
      const series = kpiData.map(entry => entry.data).flat()

      diagram.value = this.calculateSingleValue(series, average)
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, average: boolean = true) {
    const s1 = this.dataService.timeSeriesData.subscribe((data:TimeSeriesDataDictionary) => {
      this.updateSingleValue(diagram, average, data)
    });

    return [s1]
  }
}
