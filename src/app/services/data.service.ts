import { Injectable, inject } from '@angular/core';
import { DatasetKey, KPIList, TimeSeriesEndpointKey, ArtificialDatasetKey, EndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, KPIResult, TimeInterval, Series, TimeSeriesDataDictionary, Dataset, TimeSeriesResult, TimeUnit, DataEvents as DataEvent, EndpointUpdateEvent, MetaInfo } from '@app/types/time-series-data.model';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, timeInterval } from 'rxjs';
import { ThemeService } from './theme.service';
import { HttpClient } from '@angular/common/http';
import { mergeDatasets, sortedMerge, timeIntervalEquals, timeIntervalIncludes, toDatasetTotal, toSeriesId } from './data-utils';
import { fetchKPIData, fetchMetaInfo, fetchTSRaw, fetchTimeSeriesData } from './http-utils';
import moment from 'moment';

type Handler<E> = (event: E) => void;

class EventDispatcher<E> { 
    private handlers: Map<string, Handler<E>> = new Map<string, Handler<E>>();
    fire(event: E) { 
        for (let h of this.handlers.values())
            h(event);
    }
    register(handler: Handler<E>, id: string) { 
        this.handlers.set(id, handler);
    }
    unregister(id: string) { 
      this.handlers.delete(id);
    }
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  http: HttpClient = inject(HttpClient);
  themeService: ThemeService = inject(ThemeService);

  readonly timeSeriesData:TimeSeriesDataDictionary = new TimeSeriesDataDictionary();

  private datasetConfigurations: Map<DatasetKey, DatasetRegistry[]> = new Map<DatasetKey, DatasetRegistry[]>();
  private artificialDatasetToEndpoints: Map<DatasetKey, EndpointKey[]> = new Map<DatasetKey, EndpointKey[]>([
    [ArtificialDatasetKey.TOTAL_CONSUMPTION, [TimeSeriesEndpointKey.ENERGY_CONSUMPTION]],
    [ArtificialDatasetKey.TOTAL_PRODUCTION, [TimeSeriesEndpointKey.ENERGY_CONSUMPTION]],
    [ArtificialDatasetKey.TOTAL_EMISSIONS, [TimeSeriesEndpointKey.SCOPE_2_EMISSIONS, TimeSeriesEndpointKey.SCOPE_1_EMISSIONS]],
    [ArtificialDatasetKey.ALL_SCOPE_EMISIONS_COMBINED, [TimeSeriesEndpointKey.SCOPE_2_EMISSIONS, TimeSeriesEndpointKey.SCOPE_1_EMISSIONS]],
  ])

  readonly fetchedEndpoints: Set<DatasetKey> = new Set<DatasetKey>();
  readonly timeInterval:BehaviorSubject<TimeInterval[]> = new BehaviorSubject<TimeInterval[]>([]);

  private readonly events: Map<DataEvent, EventDispatcher<any>> = new Map<DataEvent, EventDispatcher<any>>([
    [DataEvent.BeforeUpdate, new EventDispatcher<EndpointUpdateEvent>()],
  ]);

  readonly metaInfo: BehaviorSubject<MetaInfo[]|undefined> = new BehaviorSubject<MetaInfo[]|undefined>(undefined);

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

    this.getDataset(TimeSeriesEndpointKey.ENERGY_CONSUMPTION).pipe(
      map((dataset) => toDatasetTotal(dataset, TimeSeriesEndpointKey.ENERGY_CONSUMPTION, 'Total Consumption', 'consumption-combined'))
    ).subscribe(this.getDataset(ArtificialDatasetKey.TOTAL_CONSUMPTION))

    this.getDataset(TimeSeriesEndpointKey.ENERGY_CONSUMPTION).pipe(
      map((dataset) => {
        return toDatasetTotal({
          series: dataset.series.filter((series) => series.local),
          timeIntervals: dataset.timeIntervals
        }, TimeSeriesEndpointKey.ENERGY_CONSUMPTION, 'Total Production', 'consumption-combined')
      })
    ).subscribe(this.getDataset(ArtificialDatasetKey.TOTAL_PRODUCTION))

    combineLatest([this.getDataset(TimeSeriesEndpointKey.SCOPE_1_EMISSIONS), this.getDataset(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS)])
    .pipe(
      map((datasets) => mergeDatasets(datasets))
    ).subscribe(this.getDataset(ArtificialDatasetKey.ALL_SCOPE_EMISIONS_COMBINED))

    this.getDataset(ArtificialDatasetKey.ALL_SCOPE_EMISIONS_COMBINED).pipe(
      map((dataset: Dataset) => toDatasetTotal(dataset, ArtificialDatasetKey.ALL_SCOPE_EMISIONS_COMBINED, 'Total Emissions', 'emissions-combined'))
    ).subscribe(this.getDataset(ArtificialDatasetKey.TOTAL_EMISSIONS))

    fetchMetaInfo(this.http).subscribe((info: MetaInfo[]) => {
      this.metaInfo.next(info)
    })

    this.metaInfo.subscribe((info: MetaInfo[]|undefined) => {
      const id = TimeSeriesEndpointKey.TS_RAW
      const registries = this.datasetConfigurations.get(id)
      if (registries) {
        this.fetchDatasets()
      }
    })
  }

  getCurrentTimeInterval(timeInterval?: TimeInterval[]): TimeInterval {
    if (timeInterval) return timeInterval[0]
    return this.timeInterval.getValue()[0]
  }

  getMaximumDatasetTimeInterval(): TimeInterval {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    const metaInfo = this.metaInfo.getValue() || []
    metaInfo.forEach((info) => {
      min = Math.min(moment(info.min_timestamp).valueOf(), min)
      max = Math.max(moment(info.max_timestamp).valueOf(), max)
    })

    return {start: moment(min), end: moment(max), step: 1, stepUnit: TimeUnit.DAY}
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
    const endpoints = this.artificialDatasetToEndpoints.get(registry.endpointKey)
    if (endpoints) {
      for (const endpoint of endpoints) {
        const newRegistry = {...registry, endpointKey: endpoint}
        this.registerDataset(newRegistry)
      }
      return registry;
    }

    let registries = this.datasetConfigurations.get(registry.endpointKey)
    if (!registries) {
      registries = []
      this.datasetConfigurations.set(registry.endpointKey, registries)
    }

    const newRegistries = [...registries.filter((r) => r.id !== registry.id), registry]
    this.datasetConfigurations.set(registry.endpointKey, newRegistries)

    if (this.metaInfo.getValue()) this.fetchDataset(registry.endpointKey, newRegistries)

    return registry
  }

  on(event: DataEvent, handler: Handler<any>, id: string) {this.events.get(event)?.register(handler, id)}
  off(event: DataEvent, id: string) {this.events.get(event)?.unregister(id)}

  unregisterDataset(registry: DatasetRegistry) {
    const endpoints = this.artificialDatasetToEndpoints.get(registry.endpointKey)
    if (endpoints) {
      for (const endpoint of endpoints) {
        const newRegistry = {...registry, endpointKey: endpoint}
        this.unregisterDataset(newRegistry)
      }
      return;
    }

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
    if (currentTimeInterval) {
      const newTimeInterval = {
        start: (timeInterval.start?.isValid()) ? timeInterval.start : currentTimeInterval.start,
        end: (timeInterval.end?.isValid()) ? timeInterval.end : currentTimeInterval.end,
        step: (timeInterval.step) ? timeInterval.step : currentTimeInterval.step,
        stepUnit: (timeInterval.stepUnit) ? timeInterval.stepUnit : currentTimeInterval.stepUnit,
      }
  
      this.timeInterval.next([newTimeInterval])
    } else {
      this.timeInterval.next([timeInterval as TimeInterval])
    }
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

  insertNewData(key: string, data: Series[], timeIntervals:TimeInterval[]) {
    const BehaviorSubject = this.getDataset(key)
    const oldDataset = BehaviorSubject.getValue()
    const oldDataSeries = oldDataset.series

    // sort newData
    for (const value of data) {
      value.data.sort((a, b) => a[0] - b[0])
    }

    const newData: Dataset = {
      series: [],
      timeIntervals: [
        ...oldDataset.timeIntervals.filter((oldTimeInterval) => timeIntervals.some((newTimeInterval) => !timeIntervalIncludes(newTimeInterval, oldTimeInterval))), 
        ...timeIntervals]
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

  fetchDatasets() {
    for (const [id, registries] of this.datasetConfigurations) {
      this.fetchDataset(id, registries)
    }
  }

  fetchDataset(endpointKey: DatasetKey, registries: DatasetRegistry[], timeIntervals: TimeInterval[] = this.timeInterval.getValue(), force: boolean = false) {
    if ((this.fetchedEndpoints.has(endpointKey) && !force) || registries.length == 0 || timeIntervals.length === 0) return;

    const localData = this.timeSeriesData.get(endpointKey)?.getValue()
    if (localData) {
      // filter out time intervals that are already loaded
      timeIntervals = timeIntervals.filter((interval) => !localData.timeIntervals.some((localInterval) => timeIntervalIncludes(interval, localInterval)))
    }
    // filter out timeIntervals that are doubled in the array
    timeIntervals = timeIntervals.filter((interval, index) => timeIntervals.findIndex((i) => timeIntervalEquals(i, interval)) === index)

    // fire event
    this.events.get(DataEvent.BeforeUpdate)?.fire({endpointKey: endpointKey, timeIntervals: timeIntervals})

    this.fetchedEndpoints.add(endpointKey)
    
    if (endpointKey === TimeSeriesEndpointKey.TS_RAW) {
      const metaInfo = this.metaInfo.getValue() || []
      const identifiers = metaInfo.map((info) => info.identifier)
      fetchTSRaw(this.http, identifiers, timeIntervals).subscribe((data) => {
        this.insertNewData(endpointKey, data, timeIntervals)
      })
    } else if (timeIntervals.length > 0) {
      if (KPIList.includes(endpointKey)) {
        timeIntervals.forEach((interval) => fetchKPIData(this.http, endpointKey, interval).subscribe((data: Series[]) => {
          this.getDataset(endpointKey).next({
            series: data,
            timeIntervals: [interval]
          })
        }))
      } else {
        fetchTimeSeriesData(this.http, endpointKey, timeIntervals).subscribe((data: Series[]) => {
          for (const series of data) {
            series.name = this.themeService.getEnergyTypeName(series.type, series.local) || series.name
            series.color = this.themeService.colorMap.get(series.type)
          }
          this.insertNewData(endpointKey, data, timeIntervals)
        })
      }

    } else {
      if (localData) this.getDataset(endpointKey).next(localData);
    }
  }
}
