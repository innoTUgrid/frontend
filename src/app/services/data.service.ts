import { Injectable, inject } from '@angular/core';
import { HighchartsDiagram, DatasetKey, SingleValueDiagram, KPIEndpointKey, KPIList } from '@app/types/kpi.model';
import { CustomIntervalRegistry, DatasetRegistry, KPIResult, TimeInterval, Series, TimeSeriesDataDictionary, Dataset, TimeSeriesResult } from '@app/types/time-series-data.model';
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

  readonly timeSeriesData:TimeSeriesDataDictionary = new TimeSeriesDataDictionary();

  datasetConfigurations: Map<string, DatasetRegistry> = new Map<string, DatasetRegistry>();

  readonly timeInterval:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>({start: moment("2019-01-01T00:00:00.000Z"), end: moment("2019-02-01T00:00:00.000Z"), step:1, stepUnit:"day"});

  constructor() {
    this.timeInterval.subscribe((timeInterval: TimeInterval) => {
      this.fetchDatasets()
    })
  }

  getDataset(key: string): Dataset {
    let dataset = this.timeSeriesData.get(key)
    if (!dataset) {
      dataset = {
        series: new BehaviorSubject<Series[]>([])
      }
      this.timeSeriesData.set(key, dataset)
    }
    return dataset
  }

  getBehaviorSubject(key: string): BehaviorSubject<Series[]> {
    let dataset = this.getDataset(key)
    return dataset.series
  }

  registerDataset(key: DatasetKey, id: string, customInterval?: CustomIntervalRegistry): void {
    const registry = {id: id, endpointKey: key, customInterval: customInterval}
    this.datasetConfigurations.set(id, registry)

    this.fetchDataset(registry)
  }

  unregisterDataset(id: string) {
    this.datasetConfigurations.delete(id)
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

  async fetchDatasets(customIntervalsToo: boolean = false) {
    for (const [id, registry] of this.datasetConfigurations) {
      if (!registry.customInterval || customIntervalsToo) {
        this.fetchDataset(registry)
      }
    }
  }

  async fetchDataset(registry: DatasetRegistry) {
    let localKey: string = registry.endpointKey
    let timeInterval = this.timeInterval.getValue()
    if (registry.customInterval) {
      localKey = registry.customInterval.key
      timeInterval = registry.customInterval.fixedTimeInterval
    }

    const localData = this.timeSeriesData.get(localKey)
    if (localData) {
      const timeRange = localData.timeRange
      if (timeRange && timeIntervalEquals(timeRange, timeInterval)) { // do not call the same request twice
        return
      }
    }


    if (KPIList.includes(registry.endpointKey)) {
      this.fetchKPIData(registry.endpointKey, timeInterval, localKey)
    } else {
      this.fetchTimeSeriesData(registry.endpointKey, timeInterval, localKey)
    }
  }

  async fetchKPIData(kpi: DatasetKey, timeInterval: TimeInterval, localKey: string) {
    // this is important such that while an endpoint loades data, no other call on the same endpoint is made
    this.getDataset(localKey).timeRange = timeInterval
    const url = `${environment.apiUrl}/v1/kpi/${kpi}/`;
    this.http.get<KPIResult>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
      }
    })
    .subscribe((kpiValue) => {
      const series: Series[] = [
        {type:kpi, name:kpiValue.name, data:[
          [
            new Date().getTime(), 
            kpiValue.value, 
          ]
        ],
        unit:kpiValue.unit? kpiValue.unit : undefined, 
        consumption:true,
      },
      ]

      this.getBehaviorSubject(localKey).next(series);
    });
  }

  async fetchTimeSeriesData(key: DatasetKey, timeInterval: TimeInterval, localKey: string) {
    // this is important such that while an endpoint loades data, no other call on the same endpoint is made
    this.getDataset(localKey).timeRange = timeInterval
    const url = `${environment.apiUrl}/v1/kpi/${key}/`;
    this.http.get<TimeSeriesResult[]>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
        interval: '1hour'
      }
    })
    .subscribe((timeSeriesResult: TimeSeriesResult[]) => {
      const seriesMap: Map<string, Series> = new Map();

      for (const entry of timeSeriesResult) {
        let data: number[][];
        const carrierName = entry.carrier_name
        const seriesKey = carrierName + (entry.local ? '' : ' (external)')

        const currentSeries = seriesMap.get(seriesKey)
        if (!currentSeries) {
          data = []
          let name = this.themeService.energyTypesToName.get(carrierName)
          if (!name) name = carrierName
          seriesMap.set(seriesKey, {
            name: name,
            type: carrierName,
            data: data,
            unit: entry.unit,
            consumption: (key === 'consumption') ? true : false,
            local: entry.local,
          })
        } else {
          data = currentSeries.data;
        }

        data.push([
          new Date(entry.bucket).getTime(),
          entry.value,
        ])
      }
      // sort newData
      const seriesArray = Array.from(seriesMap.values())
      for (const value of seriesArray) {
        value.data.sort((a, b) => a[0] - b[0])
      }

      this.getBehaviorSubject(localKey).next(seriesArray);
    });
  }
}
