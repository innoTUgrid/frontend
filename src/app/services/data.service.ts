import { Injectable, inject } from '@angular/core';
import { HighchartsDiagram, DatasetKey, SingleValueDiagram, KPIKey } from '@app/types/kpi.model';
import { KPIResult, TimeInterval, TimeSeriesData, TimeSeriesDataDictionary, TimeSeriesDataPoint, TimeSeriesResult } from '@app/types/time-series-data.model';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ThemeService } from './theme.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

function timeIntervalEquals(a: TimeInterval, b: TimeInterval): boolean {
  return a.start.isSame(b.start) && a.end.isSame(b.end) && a.step === b.step && a.stepUnit === b.stepUnit
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  http: HttpClient = inject(HttpClient);
  themeService: ThemeService = inject(ThemeService);

  readonly timeSeriesData:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(new TimeSeriesDataDictionary());
  readonly newTimeSeriesData:Subject<TimeSeriesDataDictionary> = new Subject<TimeSeriesDataDictionary>();

  currentDatasets: DatasetKey[] = [];

  readonly timeInterval:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>({start: moment("2019-01-01T00:00:00.000Z"), end: moment("2019-02-01T00:00:00.000Z"), step:1, stepUnit:"day"});

  constructor() {
    this.newTimeSeriesData.subscribe((data: TimeSeriesDataDictionary) => {
      const newData = new TimeSeriesDataDictionary(this.timeSeriesData.getValue())
      for (const [key, value] of data) {
        newData.set(key, value)
      }
      this.timeSeriesData.next(newData)
    })

    this.timeInterval.subscribe((timeInterval: TimeInterval) => {
      this.fetchDatasets(timeInterval)
    })
  }

  updateDatasets(datasets: DatasetKey[]): void {
    const filtered = datasets.filter(key => !this.currentDatasets.includes(key))
    this.fetchDatasets(this.timeInterval.getValue(), filtered)
    this.currentDatasets = datasets.concat(this.currentDatasets)
  }

  updateTimeSeriesData(timeSeriesData: TimeSeriesDataDictionary): void {
    this.newTimeSeriesData.next(timeSeriesData)
  }

  updateTimeInterval(timeInterval: Partial<TimeInterval>): void {
    // only update valid values
    const currentTimeInterval = this.timeInterval.getValue()
    const newTimeInterval = {
      start: (timeInterval.start?.isValid()) ? timeInterval.start : currentTimeInterval.start,
      end: (timeInterval.end?.isValid()) ? timeInterval.end : currentTimeInterval.end,
      step: (timeInterval.step) ? timeInterval.step : currentTimeInterval.step,
      stepUnit: (timeInterval.stepUnit) ? timeInterval.stepUnit : currentTimeInterval.stepUnit,
    }

    if (!timeIntervalEquals(newTimeInterval, currentTimeInterval)) {
      this.timeInterval.next(newTimeInterval)
    }
  }

  async fetchDatasets(timeInterval: TimeInterval, datasetKeys?: DatasetKey[]) {
    if (!datasetKeys) datasetKeys = this.currentDatasets

    let kpis: DatasetKey[] = Object.values(KPIKey)
    for (const key of datasetKeys) {
      if (kpis.includes(key)) {
        this.fetchKPIData(key, timeInterval)
      } else {
        this.fetchTimeSeriesData(key, timeInterval)
      }
    }
  }

  async fetchKPIData(kpi: string, timeInterval: TimeInterval) {
    const url = `${environment.apiUrl}/v1/kpi/${kpi}/`;
    this.http.get<KPIResult>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
      }
    })
    .subscribe((kpiValue) => {
      const newData = new TimeSeriesDataDictionary([
        [kpi, [
          {type:kpi, name:kpiValue.name, data:[
            {
              timestamp:new Date().getTime(), 
              value:kpiValue.value, 
              timeRange: timeInterval
            }
          ],
          unit:kpiValue.unit? kpiValue.unit : undefined, 
          consumption:true,
        },
        ]]
      ]);

      this.newTimeSeriesData.next(newData);
    });
  }

  async fetchTimeSeriesData(key: string, timeInterval: TimeInterval) {
    const url = `${environment.apiUrl}/v1/kpi/${key}/`;
    this.http.get<TimeSeriesResult[]>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
        interval: '1hour'
      }
    })
    .subscribe((timeSeriesResult: TimeSeriesResult[]) => {
      const newData = new TimeSeriesDataDictionary();
      const series: Map<string, TimeSeriesData> = new Map();

      for (const entry of timeSeriesResult) {
        let data: TimeSeriesDataPoint[];
        const carrierName = entry.carrier_name
        const seriesKey = carrierName + (entry.local ? '' : ' (external)')
        if (!series.has(seriesKey)) {
          data = []
          let name = this.themeService.energyTypesToName.get(carrierName)
          if (!name) name = carrierName
          series.set(seriesKey, {
            name: name,
            type: carrierName,
            data: data,
            unit: entry.unit,
            consumption: (key === 'consumption') ? true : false,
            local: entry.local,
          })
        } else {
          data = series.get(seriesKey)?.data as TimeSeriesDataPoint[];
        }

        data.push({
          timestamp: new Date(entry.bucket).getTime(),
          value: entry.value,
          timeRange: timeInterval
        })
      }
      // sort newData
      const seriesArray = Array.from(series.values())
      for (const value of seriesArray) {
        value.data.sort((a, b) => a.timestamp - b.timestamp)
      }

      newData.set(key, seriesArray)
      this.newTimeSeriesData.next(newData);
    });
  }
}
