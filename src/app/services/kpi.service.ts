import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
// import json
import * as testData from './data/readKPIs.json';

import { TimeSeriesDataPoint, TimeSeriesDataDictionary, TimeInterval } from '../types/time-series-data.model';

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
      // delta update of time series data
      for (let key in data) {
        const newSeries = data.get(key);
        if (!newSeries) break

        const currentSeries = this.timeSeriesData.get(key);
        if (currentSeries) {
          // merge both series. newSeries has newer values for the interval this.timeInterval
          const start = this.timeInterval.start.getTime();
          const end = this.timeInterval.end.getTime();
          const newSeriesFiltered = newSeries.filter(entry => entry.time.getTime() < start || entry.time.getTime() > end);
          const currentSeriesFiltered = currentSeries.filter(entry => entry.time.getTime() < start || entry.time.getTime() > end);
          const mergedSeries = [...newSeriesFiltered, ...currentSeriesFiltered];
          mergedSeries.sort((a, b) => a.time.getTime() - b.time.getTime());
          this.timeSeriesData.set(key, mergedSeries);
        } else {
          // if it is not, then set timeSeriesData[key] to data[key]
          this.timeSeriesData.set(key, newSeries);
        }
      }
    })

    // read the object from the data/readKPIs.json file and load it into the time series data dictionary
    // this.timeSeriesData$$.subscribe((data) => {
    //   console.log("all data")
    //   console.log(data)
    // });
    this.loadTimeSeriesData();
  }

  loadTimeSeriesData():void {
    const key = 'energyConsumption'
    const value = testData[key];
    const convertedData = value.map(entry => ({time: new Date(entry.time), value: entry.value, meta: entry.meta }));
    this.timeSeriesData.set(key, convertedData);
    this.timeSeriesData$$.next(this.timeSeriesData);
    // const interval = this.timeInterval$$
    // setTimeout(function() {
    //   interval.next({
    //     start:new Date("2019-01-01T01:00:00.000Z"),
    //     end:new Date("2019-01-01T02:00:00.000Z"),
    //     step:15,
    //     stepUnit:"minute"
    //   });
    // }, 5000);
    // setTimeout(function() {
    //   interval.next({
    //     start:new Date("2019-01-01T02:00:00.000Z"),
    //     end:new Date("2019-01-01T03:00:00.000Z"),
    //     step:30,
    //     stepUnit:"minute"
    //   });
    // }, 10000);
  }

}
