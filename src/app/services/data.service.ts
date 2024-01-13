import { Injectable, inject } from '@angular/core';
import { HighchartsDiagram, DatasetKey, SingleValueDiagram, KPIEndpointKey, KPIList } from '@app/types/kpi.model';
import { DatasetRegistry, KPIResult, TimeInterval, Series, TimeSeriesDataDictionary, Dataset, TimeSeriesResult, TimeUnit } from '@app/types/time-series-data.model';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { ThemeService } from './theme.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

function timeIntervalEquals(a: TimeInterval, b: TimeInterval): boolean {
  return a.start.isSame(b.start) && a.end.isSame(b.end) && a.step === b.step && a.stepUnit === b.stepUnit
}

function timeIntervalIncludes(larger: TimeInterval, smaller: TimeInterval): boolean {
  return larger.start.isSameOrBefore(smaller.start) && larger.end.isSameOrAfter(smaller.end) && larger.step === smaller.step && larger.stepUnit === smaller.stepUnit
}

function sortedMerge(a: number[][], b: number[][]): number[][] {
  const data = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i][0] < b[j][0]) { // a smaller
      data.push(a[i++])
    } else if (b[j][0] < a[i][0]) { // b smaller
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

  datasetConfigurations: Map<DatasetKey, DatasetRegistry[]> = new Map<DatasetKey, DatasetRegistry[]>();

  readonly fetchedEndpoints: Set<DatasetKey> = new Set<DatasetKey>();
  readonly timeInterval:BehaviorSubject<TimeInterval[]> = new BehaviorSubject<TimeInterval[]>([
    // {start: moment("2019-01-01T00:00:00.000Z"), end: moment("2019-02-01T00:00:00.000Z"), step:1, stepUnit:TimeUnit.DAY},
    // the next two are the current year and the last year
    // {start: moment().startOf('year'), end: moment(), step:1, stepUnit:TimeUnit.MONTH},
    // {start: moment().subtract(1, 'year').startOf('year'), end: moment().subtract(1, 'year').endOf('year'), step:1, stepUnit:TimeUnit.MONTH},
    {start: moment('2019-01-01T00:00:00Z').startOf('year'), end: moment('2019-01-01T11:00:00Z').endOf('year'), step:1, stepUnit:TimeUnit.MONTH},
    {start: moment('2019-01-02T00:00:00Z').startOf('year'), end: moment('2019-01-02T11:00:00Z').endOf('year'), step:1, stepUnit:TimeUnit.MONTH},
  ]);

  constructor() {
    this.timeInterval.subscribe((timeInterval: TimeInterval[]) => {
      this.fetchedEndpoints.clear()
      for (const [id, dataset] of this.timeSeriesData) {
        const value = dataset.getValue()
        value.timeIntervals = value.timeIntervals.filter((localInterval) => timeInterval.some((newInterval) => timeIntervalIncludes(localInterval, newInterval)))
        if (KPIList.includes(id)) this.filterOutOldData(value.series, value.timeIntervals)
      }
      this.fetchDatasets()
    })
  }

  getCurrentTimeInterval(timeInterval?: TimeInterval[]): TimeInterval {
    if (timeInterval) return timeInterval[0]
    return this.timeInterval.getValue()[0]
  }

  getCurrentComparisionTimeIntervals(timeInterval?: TimeInterval[]): TimeInterval[] {
    if (timeInterval) return timeInterval.slice(0, 2)
    const timeIntervals = this.timeInterval.getValue()
    if (timeIntervals.length >= 2) {
      return timeIntervals.slice(0, 2)
    } else {
      return timeIntervals
    }
  }

  getDataset(key: string): BehaviorSubject<Dataset> {
    let dataset = this.timeSeriesData.get(key)
    if (!dataset) {
      dataset = new BehaviorSubject<Dataset>({
        series: [],
        timeIntervals: [],
      })
      this.timeSeriesData.set(key, dataset)
    }
    return dataset
  }

  registerDataset(registry: DatasetRegistry): DatasetRegistry {
    let registries = this.datasetConfigurations.get(registry.endpointKey)
    if (!registries) {
      registries = []
      this.datasetConfigurations.set(registry.endpointKey, registries)
    }

    const newRegistries = [...registries.filter((r) => r.id !== registry.id), registry]
    this.datasetConfigurations.set(registry.endpointKey, newRegistries)

    this.fetchDataset(registry.endpointKey, newRegistries)

    return registry
  }

  unregisterDataset(registry: DatasetRegistry) {
    const registries = this.datasetConfigurations.get(registry.endpointKey)
    if (registries) {
      this.datasetConfigurations.set(registry.endpointKey, registries.filter((r) => r.id !== registry.id))
    }
  }

  updateTimeIntervalComparision(year1?: TimeInterval, year2?: TimeInterval) {
    const newTimeIntervals = [...this.timeInterval.getValue()]
    
    if (
        (!year1 || timeIntervalEquals(year1, newTimeIntervals[0])) &&
        (!year2 || timeIntervalEquals(year2, newTimeIntervals[1]))
        ) 
          return;

    if (year1) newTimeIntervals[0] = year1
    if (year2) newTimeIntervals[1] = year2

    this.timeInterval.next(newTimeIntervals)
  }

  updateTimeInterval(timeInterval: Partial<TimeInterval>): void {
    // only update valid values
    const currentTimeInterval = this.timeInterval.getValue()[0]
    const newTimeInterval = {
      start: (timeInterval.start?.isValid()) ? timeInterval.start : currentTimeInterval.start,
      end: (timeInterval.end?.isValid()) ? timeInterval.end : currentTimeInterval.end,
      step: (timeInterval.step) ? timeInterval.step : currentTimeInterval.step,
      stepUnit: (timeInterval.stepUnit) ? timeInterval.stepUnit : currentTimeInterval.stepUnit,
    }

    this.timeInterval.next([newTimeInterval])
  }

  filterOutOldData(data: Series[], timeIntervals: TimeInterval[]): Series[] {
    const timeIntervalsNumber = timeIntervals.map((interval) => { return {start: interval.start.valueOf(), end: interval.end.valueOf()}})
    const newData: Series[] = []
    for (const series of data) {
      if (timeIntervals.some((interval) => interval.stepUnit === series.timeUnit)) {
        series.data = series.data.filter(
          (value) => timeIntervalsNumber.some((interval) => value[0] >= interval.start && value[0] <= interval.end)
        )
        newData.push(series)
      }
    }
    return newData
  }

  insertNewData(key: string, data: Series[], timeInterval:TimeInterval) {
    const BehaviorSubject = this.getDataset(key)
    const oldDataset = BehaviorSubject.getValue()
    const oldDataSeries = oldDataset.series

    // sort newData
    for (const value of data) {
      value.data.sort((a, b) => a[0] - b[0])
    }

    const newData: Dataset = {
      series: [],
      timeIntervals: [...oldDataset.timeIntervals.filter((interval) => !timeIntervalEquals(interval, timeInterval)), timeInterval]
    }


    newData.series = data.filter((series) => !oldDataSeries.find((oldSeries) => oldSeries.id === series.id && oldSeries.timeUnit === series.timeUnit))
    for (const oldSeries of oldDataSeries) {
      let newSeries = data.find((newSeries) => newSeries.id === oldSeries.id && newSeries.timeUnit === oldSeries.timeUnit)
      if (newSeries) {
        const merged = sortedMerge(oldSeries.data, newSeries.data)
        newSeries.data = merged
        newData.series.push(newSeries)
      } else {
        newData.series.push(oldSeries)
      }
    }

    BehaviorSubject.next(newData)
  }

  async fetchDatasets() {
    for (const [id, registries] of this.datasetConfigurations) {
      this.fetchDataset(id, registries)
    }
  }

  async fetchDataset(endpointKey: DatasetKey, registries: DatasetRegistry[], timeIntervals: TimeInterval[] = this.timeInterval.getValue()) {
    if (this.fetchedEndpoints.has(endpointKey) || registries.length == 0) return;

    registries.forEach((registry) => {
      if (registry.beforeUpdate) {
        registry.beforeUpdate()
      }
    })

    const localData = this.timeSeriesData.get(endpointKey)?.getValue()
    if (localData) {
      // filter out time intervals that are already loaded
      timeIntervals = timeIntervals.filter((interval) => !localData.timeIntervals.some((localInterval) => timeIntervalEquals(interval, localInterval)))
    }

    this.fetchedEndpoints.add(endpointKey)
    if (timeIntervals.length > 0) {
      let fetch = this.fetchTimeSeriesData.bind(this)
      if (KPIList.includes(endpointKey)) fetch = this.fetchKPIData.bind(this)

      timeIntervals.forEach((interval) => fetch(endpointKey, interval, endpointKey))
    } else {
      if (localData) this.getDataset(endpointKey).next(localData);
    }
  }

  async fetchKPIData(endpointKey: DatasetKey, timeInterval: TimeInterval, localKey: string) {
    const url = `${environment.apiUrl}/v1/kpi/${endpointKey}/`;
    this.http.get<KPIResult>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
      }
    })
    .subscribe((kpiValue) => {
      const series: Series[] = [
        {type:endpointKey, name:kpiValue.name, data:[
          [
            Math.round((timeInterval.start.valueOf() + timeInterval.end.valueOf())/2), 
            kpiValue.value, 
          ]
        ],
        unit:kpiValue.unit? kpiValue.unit : undefined, 
        consumption:true,
        id:localKey,
        timeUnit: timeInterval.stepUnit,
      },
      ]

      const dataset: Dataset = {
        series: series,
        timeIntervals: [timeInterval],
      }

      this.getDataset(localKey).next(dataset);
    });
  }

  toSeriesId(endpoint: string, type: string, local: boolean): string {
    return `${endpoint}.${type}.${local ? 'local' : 'external'}`
  }

  async fetchTimeSeriesData(endpointKey: DatasetKey, timeInterval: TimeInterval, localKey: string) {
    const url = `${environment.apiUrl}/v1/kpi/${endpointKey}/`;
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
        const seriesKey = this.toSeriesId(endpointKey, carrierName, entry.local)

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
            consumption: (endpointKey === 'consumption') ? true : false,
            local: entry.local,
            timeUnit: timeInterval.stepUnit
          })
        } else {
          data = currentSeries.data;
        }

        data.push([
          moment(entry.bucket).valueOf(),
          entry.value,
        ])
      }

      this.insertNewData(localKey, Array.from(seriesMap.values()), timeInterval);
    });
  }
}
