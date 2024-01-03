import { Injectable, inject } from '@angular/core';
import { HighchartsDiagram, SingleValueDiagram } from '@app/types/kpi.model';
import { TimeInterval, TimeSeriesDataDictionary, TimeSeriesDataPoint } from '@app/types/time-series-data.model';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from './theme.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // time series data dictionary which contains all the data for all kpis
  timeSeriesData:TimeSeriesDataDictionary = new TimeSeriesDataDictionary();
  timeSeriesData$$:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(new TimeSeriesDataDictionary());

  timeInterval:TimeInterval = {start: moment("2019-01-01T00:00:00.000Z"), end: moment("2019-02-01T02:00:00.000Z"), step:1, stepUnit:"day"};
  timeInterval$$:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>(this.timeInterval);

  constructor() { 
    this.timeSeriesData$$.subscribe((data: TimeSeriesDataDictionary) => { 
      for (const [key, value] of data) {
        this.timeSeriesData.set(key, value)
      }
    })

    this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      this.timeInterval = timeInterval
    })
  }


  updateTimeInterval(timeInterval: Partial<TimeInterval>): void {
    // only update valid values
    const newTimeInterval = {
      start: (timeInterval.start?.isValid()) ? timeInterval.start : this.timeInterval.start,
      end: (timeInterval.end?.isValid()) ? timeInterval.end : this.timeInterval.end,
      step: (timeInterval.step) ? timeInterval.step : this.timeInterval.step,
      stepUnit: (timeInterval.stepUnit) ? timeInterval.stepUnit : this.timeInterval.stepUnit,
    }

    if (newTimeInterval != this.timeInterval) {
      this.timeInterval = newTimeInterval
      this.timeInterval$$.next(newTimeInterval)
    }
  }
}
