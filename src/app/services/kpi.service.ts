import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
// import json
import * as testData from './data/readKPIs.json';

import { TimeSeriesDataPoint, TimeSeriesDataDictionary, TimeInterval } from '../types/time-series-data.model';
import { HighchartsDiagram, KPI as KPI, SingleValueDiagram } from '../types/kpi.model';

@Injectable({
  providedIn: 'root'
})

export class KpiService {

  // time series data dictionary which contains all the data for all kpis
  timeSeriesData:TimeSeriesDataDictionary = new Map<string, TimeSeriesDataPoint[]>();
  timeSeriesData$$:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(new Map<string, TimeSeriesDataPoint[]>());

  timeInterval:TimeInterval = {start:new Date("2019-01-01T00:00:00.000Z"), end:new Date("2019-01-01T02:00:00.000Z"), step:15, stepUnit:"minute"};
  timeInterval$$:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>(this.timeInterval);

  constructor() {
    this.timeSeriesData$$.subscribe((data: TimeSeriesDataDictionary) => { 
      this.timeSeriesData = data;
    })

    // read the object from the data/readKPIs.json file and load it into the time series data dictionary
    this.loadTimeSeriesData();
  }

  updateTimeInterval(timeInterval: TimeInterval): void {
    // only update valid values
    const newTimeInterval = {
      start: (timeInterval.start && !isNaN(timeInterval.start.getTime())) ? timeInterval.start : this.timeInterval.start,
      end: (timeInterval.end && !isNaN(timeInterval.end.getTime())) ? timeInterval.end : this.timeInterval.end,
      step: (timeInterval.step) ? timeInterval.step : this.timeInterval.step,
      stepUnit: (timeInterval.stepUnit) ? timeInterval.stepUnit : this.timeInterval.stepUnit,
    }

    if (newTimeInterval != this.timeInterval) {
      this.timeInterval = newTimeInterval
      this.timeInterval$$.next(newTimeInterval)
    }
  }

  subscribeSeries(diagram: HighchartsDiagram, kpiName: KPI) {
    this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const energy = data.get(kpiName)
      if (!energy) {
        return
      }

      const series: Array<Highcharts.SeriesOptionsType> = []
      const energyTypes = new Set(energy.map(entry => entry.meta.type))
      for (const type of energyTypes) {
        const typeData = energy.filter(entry => entry.meta.type === type)
        const color = (diagram.colors.length > series.length) ? diagram.colors[series.length] : undefined
        series.push({
          name: type,
          id: type, 
          data:typeData.map(entry => ([entry.time.getTime(), entry.value])),
          type: diagram.seriesType,
          color: color,
          marker:{
            lineColor: color,
          },
        })
      }
      if (diagram.chart) {
        diagram.chart.update({
          series: series
        }, true, true, true)
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.chartProperties.series = series
        diagram.updateFlag = true
      }
    });

    this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.chart.axes[0].setDataGrouping(diagram.dataGrouping, false)
        diagram.chart.xAxis[0].setExtremes(timeInterval.start.getTime(), timeInterval.end.getTime(), true, true);
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.xAxis.min = timeInterval.start.getTime();
        diagram.xAxis.max = timeInterval.end.getTime();
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.updateFlag = true
      }
    });
  }

  updateSingleValue(data: TimeSeriesDataPoint[], diagram:SingleValueDiagram, average: boolean = true) {
    let sum = 0
      for (const datapoint of data) {
          sum += datapoint.value
      }
      if (average) sum /= data.length
      diagram.value = sum
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, kpiName: KPI, average: boolean = true) {
    this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const kpiData = data.get(kpiName)
      if (!kpiData) {
          return
      }
      
      this.updateSingleValue(kpiData, diagram, average)
    });

    this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      const kpiData = this.timeSeriesData.get(kpiName)
      if (!kpiData) {
          return
      }

      // filter out data that is not in the time interval
      const filteredData = kpiData.filter(entry => entry.time >= timeInterval.start && entry.time <= timeInterval.end)
      this.updateSingleValue(filteredData, diagram, average)
    })
  }

  loadTimeSeriesData():void {
    const keys: Array<KPI> = [KPI.ENERGY_CONSUMPTION, KPI.AUTARKY]
    for (const key of keys) {
      const value = testData[key];
      const convertedData = value.map(entry => ({time: new Date(entry.time), value: entry.value, meta: entry.meta }));
      this.timeSeriesData.set(key, convertedData);
    }
    this.timeSeriesData$$.next(this.timeSeriesData);
  }

}
