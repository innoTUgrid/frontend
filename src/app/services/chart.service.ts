import { Injectable, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { TimeInterval, Series, TimeSeriesDataDictionary, Dataset } from '@app/types/time-series-data.model';
import { DataService } from './data.service';
import { HighchartsDiagram, SingleValueDiagram } from '@app/types/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  themeService: ThemeService = inject(ThemeService);
  dataService: DataService = inject(DataService);

  constructor() { }

  updateSeries(diagram: HighchartsDiagram, aggregateExternal: boolean = false, data?: Series[]) {
    if (!data) {
      return
    }

    if (aggregateExternal) {
      const externalEnergy = data.filter(entry => !entry.local).map(entry => entry.data).flat()
      externalEnergy.sort((a, b) => a[0] - b[0])
      data = [{
        name: 'Imported Energy',
        type: 'external',
        data: externalEnergy,
      }, ...data.filter(entry => entry.local)]
    }

    const allSeries = []
    for (const series of data) {
      const color = this.themeService.colorMap.get(series.type)

      const newSeries = {
          name: series.name,
          id: series.type + ' ' + diagram.kpiName, 
          data:series.data,
          type: diagram.seriesType,
          color: color,
          animation: true,
          marker:{
            lineColor: color,
          },
        }
      allSeries.push(newSeries)
    }
    if (diagram.chart) {
      diagram.chart.update({
        series: allSeries,
      }, true, true)
    } else { 
      diagram.chartProperties.series = allSeries
      diagram.updateFlag = true
    }
    if (diagram.onSeriesUpdate) {
      diagram.onSeriesUpdate()
    }
  }

  subscribeSeries(diagram: HighchartsDiagram, aggregateExternal: boolean = false) {
    let s1 = undefined;
    if (diagram.kpiName) {
      s1 = this.dataService.getBehaviorSubject(diagram.kpiName).subscribe((data:Series[]) => {
        this.updateSeries(diagram, aggregateExternal, data)
      });
    }

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


    return (s1) ? [s1, s2] : [s2]
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

      if (data.length > 1) console.error(`SingleValueDiagram can only display one series, but got ${data.length} at ${diagram.kpiName}`)
      const series = data.map(entry => entry.data).flat()

      diagram.value = this.calculateSingleValue(series, average)
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, average: boolean = true) {
    if (!diagram.kpiName) return [];
    const s1 = this.dataService.getBehaviorSubject(diagram.kpiName).subscribe((data:Series[]) => {
      this.updateSingleValue(diagram, average, data)
    });

    return [s1]
  }
}
