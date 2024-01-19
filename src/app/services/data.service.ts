import { Injectable, inject } from '@angular/core';
import { DatasetKey, KPIList, TimeSeriesEndpointKey, ArtificialDatasetKey, EndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, KPIResult, TimeInterval, Series, TimeSeriesDataDictionary, Dataset, TimeSeriesResult, TimeUnit, DataEvents as DataEvent, EndpointUpdateEvent } from '@app/types/time-series-data.model';
import moment from 'moment';
import { BehaviorSubject, Observable, forkJoin, map, timeInterval } from 'rxjs';
import { ThemeService } from './theme.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { sortedMerge, timeIntervalEquals, timeIntervalIncludes, toDatasetTotal, toSeriesId } from './data-utils';

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
    [ArtificialDatasetKey.ENERGY_CONSUMPTION_TOTAL, [TimeSeriesEndpointKey.ENERGY_CONSUMPTION]],
    [ArtificialDatasetKey.EMISSIONS_TOTAL, [TimeSeriesEndpointKey.SCOPE_2_EMISSIONS]],
  ])

  readonly fetchedEndpoints: Set<DatasetKey> = new Set<DatasetKey>();
  readonly timeInterval:BehaviorSubject<TimeInterval[]> = new BehaviorSubject<TimeInterval[]>([]);

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
    ).subscribe(this.getDataset(ArtificialDatasetKey.ENERGY_CONSUMPTION_TOTAL))

    this.getDataset(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS).pipe(
      map((dataset) => toDatasetTotal(dataset, TimeSeriesEndpointKey.SCOPE_2_EMISSIONS, 'Total Emissions', 'emissions-combined'))
    ).subscribe(this.getDataset(ArtificialDatasetKey.EMISSIONS_TOTAL))
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

    this.fetchDataset(registry.endpointKey, newRegistries)

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

  async fetchDatasets() {
    for (const [id, registries] of this.datasetConfigurations) {
      this.fetchDataset(id, registries)
    }
  }

  async fetchDataset(endpointKey: DatasetKey, registries: DatasetRegistry[], timeIntervals: TimeInterval[] = this.timeInterval.getValue()) {
    if (this.fetchedEndpoints.has(endpointKey) || registries.length == 0) return;

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
    if (timeIntervals.length > 0) {

      if (KPIList.includes(endpointKey)) {
        timeIntervals.forEach((interval) => this.fetchKPIData(endpointKey, interval, endpointKey))
      } else {
        this.fetchTimeSeriesData(endpointKey, timeIntervals, endpointKey)
      }

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

  async fetchTimeSeriesData(endpointKey: DatasetKey, timeIntervals: TimeInterval[], localKey: string) {
    const url = `${environment.apiUrl}/v1/kpi/${endpointKey}/`;

    const calls:Observable<TimeSeriesResult[]>[] = []
    for (const timeInterval of timeIntervals) {
      calls.push(
        this.http.get<TimeSeriesResult[]>(url, {
          params: {
            from: timeInterval.start.toISOString(),
            to: timeInterval.end.toISOString(),
            interval: `1${timeInterval.stepUnit}`
          }
        })
      )
    }
    forkJoin(calls).subscribe((timeSeriesResults: TimeSeriesResult[][]) => {
      const seriesMap: Map<string, Series> = new Map();

      for (const [index, timeSeriesResult] of timeSeriesResults.entries()) {
        const timeInterval = timeIntervals[index]
        for (const entry of timeSeriesResult) {
          let data: number[][];
          const carrierName = entry.carrier_name
          const seriesKey = toSeriesId(endpointKey, carrierName, entry.local, timeInterval.stepUnit)
  
          const currentSeries = seriesMap.get(seriesKey)
          if (!currentSeries) {
            data = []
            let name = this.themeService.energyTypesToName.get(carrierName + (entry.local ? '-local' : ''))
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

      }
      const seriesArray = Array.from(seriesMap.values())
      this.insertNewData(localKey, seriesArray, timeIntervals);

    });
  }
}
