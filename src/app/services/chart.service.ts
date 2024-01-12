import { Injectable, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { TimeInterval, Series, TimeSeriesDataDictionary, Dataset } from '@app/types/time-series-data.model';
import { DataService } from './data.service';
import { DatasetKey, HighchartsDiagram, SingleValueDiagram } from '@app/types/kpi.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  themeService: ThemeService = inject(ThemeService);
  dataService: DataService = inject(DataService);

  constructor() { }

  updateSeries(diagram: HighchartsDiagram, datasetKey: string, data?: Series[]) {
    if (!data) {
      return
    }

    const allSeries = []
    for (const series of data) {
      const color = (series.color) ? series.color : this.themeService.colorMap.get(series.type)

      const newSeries = {
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
    if (diagram.chart) {
      diagram.chart.update({
        series: allSeries,
      }, false, true)
      diagram.chart.hideLoading()
    } else {
      diagram.chartProperties.series = allSeries
    }
    if (diagram.onSeriesUpdate) {
      diagram.onSeriesUpdate()
    }

    if (diagram.chart) {
      diagram.chart.redraw(true)
    } else {
      diagram.updateFlag = true
    }
  }

  subscribeSeries(
    diagram: HighchartsDiagram, 
    datasetKey: string, 
    beforeProcessData: (data: Series[]) => Series[] = (data) => data,
  ): Subscription {
    const s = this.dataService.getBehaviorSubject(datasetKey).subscribe((data:Series[]) => {
      data = beforeProcessData(data)
      this.updateSeries(diagram, datasetKey, data)
    });
    return s
  }

  subscribeInterval(diagram: HighchartsDiagram): Subscription {
    const s = this.dataService.timeInterval.subscribe((timeIntervals: TimeInterval[]) => {
      // iterate over timeInetrvals with index
      for (const [index, timeInterval] of timeIntervals.entries()) {
        const minuteFormat = '%H:%M'
        const dayFormat = '%e. %b'
        diagram.xAxis[index].dateTimeLabelFormats = {
          minute: minuteFormat,
          day: timeInterval.stepUnit === 'day' ? dayFormat : minuteFormat,
        }
  
        if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
          diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
          diagram.chart.axes[index].setDataGrouping(diagram.dataGrouping, false)
          diagram.chart.xAxis[index].setExtremes(timeInterval.start.toDate().getTime(), timeInterval.end.toDate().getTime(), false, true);
        } else { // this is only reachable for code that uses highcharts-angular
          diagram.xAxis[index].min = timeInterval.start.toDate().getTime();
          diagram.xAxis[index].max = timeInterval.end.toDate().getTime();
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
    const s1 = this.dataService.getBehaviorSubject(datasetKey).subscribe((data:Series[]) => {
      this.updateSingleValue(diagram, average, data)
    });

    return [s1]
  }


  updateAverageLine(chart: Highcharts.Chart, seriesIndices?: number[]) {
    if (!seriesIndices) {
      seriesIndices = []
      chart.series.forEach((series, index) => seriesIndices?.push(index))
    }
    
    for (const seriesIndex of seriesIndices) {
      const series = chart.series[seriesIndex] as any
      const groupedData = series.groupedData
      if (groupedData) {
        let sum = 0
        for (const group of groupedData) {
          sum += group.stackTotal
        }
        sum /= groupedData.length
  
        const plotLines: Highcharts.YAxisPlotLinesOptions = {
          width: 2,
          value: sum,
          zIndex: 5,
        }
        chart.update({
          yAxis: {
            plotLines: [plotLines]
          }
        }, false, true)
      }
    }
  }
}
