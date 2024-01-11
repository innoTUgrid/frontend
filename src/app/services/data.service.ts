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

function sortedMerge(a: number[][], b: number[][]): number[][] {
  const data = new Array<number[]>(a.length + b.length)
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i][0] < b[j][0]) { // a smaller
      data.push(a[i++])
    } else if (b[i][0] < a[i][0]) { // b smaller
      data.push(b[j++])
    } else { // if equal, then filter out duplicates and always take the value of a
      const value = a[i]
      data.push(value)

      while (i < a.length && a[i][0] === value[0]) i++
      while (j < b.length && b[j][0] === value[0]) j++
    }
  }

  while (i < a.length) data.push(a[i++])
  while (j < b.length) data.push(b[j++])

  return data
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
      this.timeSeriesData.forEach((dataset: Dataset, key: string) => {
        this.filterOutOldData(dataset.series.getValue(), timeInterval)
      })
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

  registerDataset(registry: DatasetRegistry): DatasetRegistry {
    this.datasetConfigurations.set(registry.id, registry)

    this.fetchDataset(registry)

    return registry
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

  filterOutOldData(data: Series[], timeInterval: TimeInterval): void {
    const timeIntervalsNumber = {start: timeInterval.start.toDate().getTime(), end: timeInterval.end.toDate().getTime()}
    for (const series of data) {
      series.data = series.data.filter(
        (value) => value[0] >= timeIntervalsNumber.start && value[0] <= timeIntervalsNumber.end
      )
    }
  }

  insertNewData(key: string, data: Series[]) {
    const BehaviorSubject = this.getBehaviorSubject(key)
    const oldData = BehaviorSubject.getValue()

    // sort newData
    for (const value of data) {
      value.data.sort((a, b) => a[0] - b[0])
    }

    const newData: Series[] = data.filter((series) => !oldData.find((oldSeries) => oldSeries.id === series.id))
    for (const series of oldData) {
      const newSeries = data.find((newSeries) => newSeries.id === series.id)
      if (newSeries) {
        const merged = sortedMerge(series.data, newSeries.data)
        newData.push({...newSeries, data: merged})
      } else {
        newData.push(series)
      }
    }

    this.filterOutOldData(newData, this.timeInterval.getValue())

    BehaviorSubject.next(newData)
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

    if (registry.beforeUpdate) {
      registry.beforeUpdate()
    }

    const localData = this.timeSeriesData.get(localKey)
    if (localData) {
      const timeRange = localData.timeRange
      if (timeRange && timeIntervalEquals(timeRange, timeInterval)) { // do not call the same request twice
        return
      }
    }

    // this is important such that while an endpoint loades data, no other call on the same endpoint is made
    this.getDataset(localKey).timeRange = timeInterval

    if (KPIList.includes(registry.endpointKey)) {
      this.fetchKPIData(registry, timeInterval, localKey)
    } else {
      this.fetchTimeSeriesData(registry, timeInterval, localKey)
    }
  }

  async fetchKPIData(registry: DatasetRegistry, timeInterval: TimeInterval, localKey: string) {
    const url = `${environment.apiUrl}/v1/kpi/${registry.endpointKey}/`;
    this.http.get<KPIResult>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
      }
    })
    .subscribe((kpiValue) => {
      const series: Series[] = [
        {type:registry.endpointKey, name:kpiValue.name, data:[
          [
            new Date().getTime(), 
            kpiValue.value, 
          ]
        ],
        unit:kpiValue.unit? kpiValue.unit : undefined, 
        consumption:true,
        id:localKey
      },
      ]

      this.getBehaviorSubject(localKey).next(series);
    });
  }

  async fetchTimeSeriesData(registry: DatasetRegistry, timeInterval: TimeInterval, localKey: string) {
    const url = `${environment.apiUrl}/v1/kpi/${registry.endpointKey}/`;
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
        const seriesKey = registry.endpointKey + '.' + carrierName + (entry.local ? '.local' : '.external')

        const currentSeries = seriesMap.get(seriesKey)
        if (!currentSeries) {
          data = []
          let name = this.themeService.energyTypesToName.get(carrierName)
          if (!name) name = carrierName
          seriesMap.set(seriesKey, {
            id: seriesKey,
            name: name,
            type: carrierName,
            data: data,
            unit: entry.unit,
            consumption: (registry.endpointKey === 'consumption') ? true : false,
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

      this.insertNewData(localKey, Array.from(seriesMap.values()));
    });
  }
}
