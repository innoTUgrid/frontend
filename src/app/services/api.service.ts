import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TimeSeriesDataPoint, TimeSeriesDataDictionary, TimeInterval, TimeSeriesData, KPIResult, TimeSeriesResult } from '../types/time-series-data.model';
import moment from 'moment';

import { environment } from '@env/environment';
import { ThemeService } from './theme.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  themeService: ThemeService = inject(ThemeService);
  dataService: DataService = inject(DataService);

  constructor(private http: HttpClient) {
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
              time:new Date(), 
              value:kpiValue.value, 
              timeRange: {start: moment(kpiValue.from_timestamp), end: moment(kpiValue.to_timestamp), step:timeInterval.step, stepUnit:timeInterval.stepUnit}
            }
          ],
          unit:kpiValue.unit? kpiValue.unit : undefined, 
          consumption:true,
        },
        ]]
      ]);

      this.dataService.timeSeriesData$$.next(newData);
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
          time: new Date(entry.bucket),
          value: entry.value,
        })
      }

      newData.set(key, Array.from(series.values()))
      this.dataService.timeSeriesData$$.next(newData);
    });
  }
}
