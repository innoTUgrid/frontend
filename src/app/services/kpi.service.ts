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
  private timeSeriesData:TimeSeriesDataDictionary = new Map<string, TimeSeriesDataPoint[]>();
  timeSeriesData$$:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(new Map<string, TimeSeriesDataPoint[]>());

  // time interval inited with current day interval that begins
  private timeInterval:TimeInterval = {start:new Date("2019-01-01T00:00:00.000Z"), end:new Date("2019-01-01T02:00:00.000Z"), step:15, stepUnit:"minute"};
  timeInterval$$:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>(this.timeInterval);

  constructor() {
    this.timeSeriesData$$.subscribe((data: TimeSeriesDataDictionary) => { 
      this.timeSeriesData = data;
    })

    // read the object from the data/readKPIs.json file and load it into the time series data dictionary
    // this.timeSeriesData$$.subscribe((data) => {
    //   console.log("all data")
    //   console.log(data)
    // });
    this.loadTimeSeriesData();
  }

  // energy subscription
  subscribeEnergyDiagram(diagram: HighchartsDiagram, kpiName: KPI) {
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
        })
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.chartProperties.series = series
        diagram.updateFlag = true
      }
    });

    this.timeInterval$$.subscribe((timeInterval) => {
      if (diagram.chart) {
        diagram.chart.xAxis[0].setExtremes(timeInterval.start.getTime(), timeInterval.end.getTime(), false);
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.chart.axes[0].setDataGrouping(diagram.dataGrouping, true)
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.xAxis.min = timeInterval.start.getTime();
        diagram.xAxis.max = timeInterval.end.getTime();
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.updateFlag = true
      }
    });
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, kpiName: KPI, average: boolean = true) {
    this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const energy = data.get(kpiName)
      if (!energy) {
          return
      }
      
      let sum = 0
      for (const datapoint of energy) {
          sum += datapoint.value
      }
      if (average) sum /= energy.length
      diagram.value = sum
    });
  }

  loadTimeSeriesData():void {
    const keys: Array<KPI> = [KPI.ENERGY_CONSUMPTION, KPI.AUTARKY]
    for (const key of keys) {
      const value = testData[key];
      const convertedData = value.map(entry => ({time: new Date(entry.time), value: entry.value, meta: entry.meta }));
      this.timeSeriesData.set(key, convertedData);
    }
    this.timeSeriesData$$.next(this.timeSeriesData);
    const interval = this.timeInterval$$
    const timeSeriesDataSubject = this.timeSeriesData$$
    const timeSeriesData = this.timeSeriesData
    setTimeout(function() {
      // interval.next({
      //   start:new Date("2019-01-01T01:00:00.000Z"),
      //   end:new Date("2019-01-01T02:00:00.000Z"),
      //   step:15,
      //   stepUnit:"minute"
      // });
      const map = new Map<string, TimeSeriesDataPoint[]>();
      for (const key of keys) {
        const data = timeSeriesData.get(key);
        if (data) {
          map.set(key, data.slice(0,data.length/2));
        }
      }
      timeSeriesDataSubject.next(map);
      console.log(map)
    }, 2500);
    setTimeout(function() {
      // interval.next({
      //   start:new Date("2019-01-01T02:00:00.000Z"),
      //   end:new Date("2019-01-01T03:00:00.000Z"),
      //   step:30,
      //   stepUnit:"minute"
      // });
      const map = new Map<string, TimeSeriesDataPoint[]>();
      for (const key of keys) {
        const data = timeSeriesData.get(key);
        if (data) {
          map.set(key, data.slice(data.length/2, data.length));
        }
      }
      timeSeriesDataSubject.next(map);
      console.log(map)
    }, 5000);
  }

}
