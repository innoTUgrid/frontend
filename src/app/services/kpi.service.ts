import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
// import json
import * as testData from './data/readKPIs.json';

type MetaData = {
  unit: string;
  consumption: boolean;
  type: string;
}
type TimeSeriesData = {time:Date, value:number, meta:MetaData}[];
type TimeSeriesDataDictionary = Map<string, TimeSeriesData>;
type TimeInterval = [Date, Date];

@Injectable({
  providedIn: 'root'
})

export class KpiService {

  // time series data dictionary which contains all the data for all kpis
  private timeSeriesData:TimeSeriesDataDictionary = new Map<string, TimeSeriesData>();
  private timeSeriesData$$:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(this.timeSeriesData);

  // time interval inited with current day interval that begins at 00:00 and ends at 23:59
  private timeInterval:TimeInterval = [new Date("2019-01-01T00:00:00.000Z"), new Date("2019-01-01T01:00:00.000Z")];
  private timeInterval$$:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>(this.timeInterval);

  timeSeriesDataFiltered$: Observable<TimeSeriesDataDictionary> = combineLatest([
    this.timeSeriesData$$,
    this.timeInterval$$,
  ]).pipe(
    map(([data, timeInterval]) => {
      for (const [key, value] of data.entries()) {
        data.set(key, this.filterDataForTimeInterval(value, timeInterval));
      }
      return data; 
    })
  );

  constructor() {
    // read the object from the data/readKPIs.json file and load it into the time series data dictionary
    this.timeSeriesData$$.subscribe((data) => {
      console.log(data)
    });
    this.timeSeriesDataFiltered$.subscribe((data) => {
      console.log(data)
    });
    this.loadTimeSeriesData();
  }

  loadTimeSeriesData():void {
    const key = 'energyConsumption'
    const value = testData[key];
    const convertedData = value.map(entry => ({time: new Date(entry.time), value: entry.value, meta: entry.meta }));
    this.timeSeriesData.set(key, convertedData);
    this.timeSeriesData$$.next(this.timeSeriesData);
    this.timeInterval$$.next(this.timeInterval);
  }

  filterDataForTimeInterval(data:TimeSeriesData, timeInterval:TimeInterval):TimeSeriesData {
    return data.filter(
      (entry) => entry.time >= timeInterval[0] && entry.time <= timeInterval[1]
    );
  }

}
