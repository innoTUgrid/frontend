import { Injectable, inject } from '@angular/core';
import { DatasetKey, KPIList, TimeSeriesEndpointKey, ArtificialDatasetKey, EndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, TimeInterval, Series, TimeSeriesDataDictionary, Dataset, TimeUnit, DataEvents as DataEvent, EndpointUpdateEvent } from '@app/types/time-series-data.model';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of, timeInterval } from 'rxjs';
import { ThemeService } from './theme.service';
import { HttpClient } from '@angular/common/http';
import { mergeDatasets, sortedMerge, timeIntervalEquals, timeIntervalIncludes, toDatasetTotal, toSeriesId } from './data-utils';
import { fetchEmissionFactors, fetchKPIData, fetchMetaInfo, fetchTSRaw, fetchTimeSeriesData } from './http-utils';
import moment from 'moment';
import { EmissionFactorsResult, MetaInfo } from '@app/types/api-result.model';
import { environment } from '@env/environment';

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

  // this is the data that is fetched from the server
  readonly timeSeriesData:TimeSeriesDataDictionary = new TimeSeriesDataDictionary();
  readonly metaInfo: BehaviorSubject<MetaInfo[]|undefined> = new BehaviorSubject<MetaInfo[]|undefined>(undefined);
  readonly emissionFactors: BehaviorSubject<EmissionFactorsResult[]> = new BehaviorSubject<EmissionFactorsResult[]>([]);
  readonly timeInterval:BehaviorSubject<TimeInterval[]> = new BehaviorSubject<TimeInterval[]>([]);

  readonly fetchedEndpoints: Set<DatasetKey> = new Set<DatasetKey>();

  private datasetConfigurations: Map<DatasetKey, DatasetRegistry[]> = new Map<DatasetKey, DatasetRegistry[]>();
  private artificialDatasetToEndpoints: Map<DatasetKey, EndpointKey[]> = new Map<DatasetKey, EndpointKey[]>([
    [ArtificialDatasetKey.TOTAL_CONSUMPTION, [TimeSeriesEndpointKey.ENERGY_CONSUMPTION]],
    [ArtificialDatasetKey.TOTAL_PRODUCTION, [TimeSeriesEndpointKey.ENERGY_CONSUMPTION]],
    [ArtificialDatasetKey.TOTAL_EMISSIONS, [TimeSeriesEndpointKey.ALL_SCOPE_EMISSIONS_COMBINED]],
    [ArtificialDatasetKey.ALL_SCOPE_EMISSIONS_MERGED, [TimeSeriesEndpointKey.ALL_SCOPE_EMISSIONS_COMBINED]],
  ])

  private combinedDatasets: Map<DatasetKey, EndpointKey[]> = new Map<DatasetKey, EndpointKey[]>([
    [TimeSeriesEndpointKey.ALL_SCOPE_EMISSIONS_COMBINED, [TimeSeriesEndpointKey.SCOPE_1_EMISSIONS, TimeSeriesEndpointKey.SCOPE_2_EMISSIONS]]
  ])

  private readonly events: Map<DataEvent, EventDispatcher<any>> = new Map<DataEvent, EventDispatcher<any>>([
    [DataEvent.BeforeUpdate, new EventDispatcher<EndpointUpdateEvent>()],
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

    this.getDataset(TimeSeriesEndpointKey.ALL_SCOPE_EMISSIONS_COMBINED)
    .pipe(
      map((datasets) => mergeDatasets([{
          ...datasets,
          series: datasets.series.map((series) => {
            return {...series, id: toSeriesId(ArtificialDatasetKey.ALL_SCOPE_EMISSIONS_MERGED, series.type, series.local || false, series.timeUnit)}
          })
        }])
      )
    ).subscribe(this.getDataset(ArtificialDatasetKey.ALL_SCOPE_EMISSIONS_MERGED))

    this.getDataset(ArtificialDatasetKey.ALL_SCOPE_EMISSIONS_MERGED).pipe(
      map((dataset: Dataset) => toDatasetTotal(dataset, ArtificialDatasetKey.ALL_SCOPE_EMISSIONS_MERGED, 'Total Emissions', 'emissions-combined'))
    ).subscribe(this.getDataset(ArtificialDatasetKey.TOTAL_EMISSIONS))

    fetchMetaInfo(this.http).subscribe(
      {
        next: (info: MetaInfo[]) => {this.metaInfo.next(info)},
        error: (error) => {
          this.metaInfo.next([])
        },
      }
    )
    fetchEmissionFactors(this.http).subscribe((factors: EmissionFactorsResult[]) => this.emissionFactors.next(factors))

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

  fetchDataset(endpointKey: DatasetKey, registries: DatasetRegistry[], timeIntervals: TimeInterval[] = this.timeInterval.getValue()): Observable<Series[]>[] {
    const localData = this.getDataset(endpointKey).getValue()
    if ((this.fetchedEndpoints.has(endpointKey)) || registries.length == 0 || timeIntervals.length === 0) return [];

    if (localData && environment.caching) {
      // filter out time intervals that are already loaded
      timeIntervals = timeIntervals.filter((interval) => !localData.timeIntervals.some((localInterval) => timeIntervalIncludes(interval, localInterval)))
    }
    // filter out timeIntervals that are doubled in the array
    timeIntervals = timeIntervals.filter((interval, index) => timeIntervals.findIndex((i) => timeIntervalEquals(i, interval)) === index)

    // fire event
    this.events.get(DataEvent.BeforeUpdate)?.fire({endpointKey: endpointKey, timeIntervals: timeIntervals})

    this.fetchedEndpoints.add(endpointKey)
    
    const observables: Observable<Series[]>[] = []
    if (endpointKey === TimeSeriesEndpointKey.TS_RAW) {
      const metaInfo = this.metaInfo.getValue() || []
      const identifiers = metaInfo.map((info) => info.identifier)
      const o = fetchTSRaw(this.http, identifiers, timeIntervals)
      o.subscribe((data) => {
        this.insertNewData(endpointKey, data, timeIntervals)
      })
      observables.push(o)
    } else if (this.combinedDatasets.has(endpointKey)) {

      observables.push(...this.fetchCombinedDataset(endpointKey, registries, timeIntervals))

    } else if (timeIntervals.length > 0) {
      if (KPIList.includes(endpointKey)) {
        timeIntervals.forEach((interval) => {
          const o = fetchKPIData(this.http, endpointKey, interval)
          o.subscribe({
            next: (data: Series[]) => {
              this.getDataset(endpointKey).next({
                series: data,
                timeIntervals: [interval]
              })
            },
            error: (error) => {
              this.getDataset(endpointKey).next({series: [], timeIntervals: [interval]})
            }
          })
          observables.push(o)
        }
        )
      } else {
        const o = fetchTimeSeriesData(this.http, endpointKey, timeIntervals).pipe(
          map((data) => {
            for (const series of data) {
              const local = series.local || false
              series.name = this.themeService.getEnergyTypeName(series.type, local) || series.name
              series.color = this.themeService.getEnergyColor(series.type, local)
            }
            return data
          })
        )
        o.subscribe((data: Series[]) => {
          this.insertNewData(endpointKey, data, timeIntervals)
        })
        observables.push(o)
      }

    } else {
      this.getDataset(endpointKey).next(localData);
    }
    return observables
  }

  fetchCombinedDataset(endpointKey: DatasetKey, registries: DatasetRegistry[], timeIntervals: TimeInterval[] = this.timeInterval.getValue()): Observable<Series[]>[] {
    const combinedDatasets = this.combinedDatasets.get(endpointKey)
    if (!combinedDatasets) return []

    const combinedObservables = combinedDatasets.map((datasetkey) => {

      const fetchedObservables = this.fetchDataset(datasetkey, registries)
      if (fetchedObservables.length === 0) {
        fetchedObservables.push(
          of(this.getDataset(datasetkey).getValue().series)
        )
      }
      return fetchedObservables

    }).flat()

    const o = forkJoin(
      combinedObservables
    ).pipe(
      map((data: Series[][]) => {
      const newData: Series[] = []
      for (const [i, seriesArray] of data.entries()) {
        newData.push(...seriesArray.map(
          (series: Series) => { return {...series, sourceDataset: combinedDatasets[i]} }
        ))
      }
      return newData
      })
    )
    o.subscribe((data: Series[]) => {
      this.insertNewData(endpointKey, data, timeIntervals)
    })
    return [o]
  }
}
