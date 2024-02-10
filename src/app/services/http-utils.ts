import { HttpClient } from "@angular/common/http";
import { DatasetKey, TimeSeriesEndpointKey } from "@app/types/kpi.model";
import { Series, TimeInterval } from "@app/types/time-series-data.model";
import { environment } from "@env/environment";
import { BehaviorSubject, Observable, forkJoin, map } from "rxjs";
import { toSeriesId } from "./data-utils";
import moment from "moment";
import { time } from "highcharts";
import { EmissionFactorsResult, KPIResult, MetaInfo, MetaValues, TSRawResult, TimeSeriesResult } from "@app/types/api-result.model";

export function getURL(endpoint: string): string {
    let url = `${environment.apiUrl}`
    if (!url.endsWith('/')) url += '/'
    url += 'v1/'
    if (endpoint) url += endpoint
    if (!url.endsWith("/")) url += '/'
    return url;
}

export function fetchKPIData(http: HttpClient, endpointKey: DatasetKey, timeInterval: TimeInterval): Observable<Series[]> {
    const url = getURL(endpointKey);
    const call = http.get<KPIResult>(url, {
        params: {
            from: timeInterval.start.toISOString(),
            to: timeInterval.end.toISOString(),
        }
    })
    .pipe(
        map((kpiValue) => {
            const series: Series[] = [
                {
                    type: endpointKey, name: kpiValue.name, data: [
                        [
                            Math.round((timeInterval.start.valueOf() + timeInterval.end.valueOf()) / 2),
                            kpiValue.value,
                        ]
                    ],
                    unit: kpiValue.unit ? kpiValue.unit : undefined,
                    consumption: true,
                    id: endpointKey,
                    timeUnit: timeInterval.stepUnit,
                    sourceDataset: endpointKey
                },
            ]

            return series
        })
    )
    return call
}

export function createCalls<ReturnType>(http: HttpClient, endpointKey: string, timeIntervals: TimeInterval[], timeUnit?: string): Observable<ReturnType>[] {
    let url = getURL(endpointKey)
    const calls: Observable<ReturnType>[] = []
    for (const timeInterval of timeIntervals) {
        http.get<ReturnType>(url, {})
        calls.push(
            http.get<ReturnType>(url, {
                params: {
                    from: timeInterval.start.toISOString(),
                    to: timeInterval.end.toISOString(),
                    interval: (timeUnit) ? timeUnit : `1${timeInterval.stepUnit}`
                }
            })
        )
    }
    return calls
}

export function fetchTimeSeriesData(http: HttpClient, endpointKey: DatasetKey, timeIntervals: TimeInterval[]): Observable<Series[]> {
    const calls: Observable<TimeSeriesResult[]>[] = createCalls<TimeSeriesResult[]>(http, endpointKey, timeIntervals)

    const join = forkJoin(calls).pipe(
        map((timeSeriesResults: TimeSeriesResult[][]) => {
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
                        seriesMap.set(seriesKey, {
                            id: seriesKey,
                            name: carrierName,
                            type: carrierName,
                            data: data,
                            unit: entry.unit,
                            consumption: (endpointKey === TimeSeriesEndpointKey.ENERGY_CONSUMPTION) ? true : false,
                            local: entry.local,
                            timeUnit: timeInterval.stepUnit,
                            sourceDataset: endpointKey
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
            return seriesArray
        })
    );
    return join;
}

export function fetchMetaInfo(http: HttpClient): Observable<MetaInfo[]> {
    const url = getURL('meta/')

    const call = http.get<MetaValues>(url).pipe(
        map(({values}: MetaValues) => {
            return values
        })
    )

    return call
}

export function fetchEmissionFactors(http: HttpClient): Observable<EmissionFactorsResult[]> {
    const url = getURL('emission_factors/')

    const call = http.get<EmissionFactorsResult[]>(url)

    return call
}

export function fetchTSRaw(http:HttpClient, identifiers: string[], timeIntervals: TimeInterval[]): Observable<Series[]> {
    const endpointKey = TimeSeriesEndpointKey.TS_RAW
    const allCalls: Observable<TSRawResult>[][] = identifiers.map((id: string) => {
        return createCalls<TSRawResult>(http, endpointKey + '/' + id + '/resample', timeIntervals)
    })

    const answer = forkJoin(
        allCalls.map((callsPerIdentifier: Observable<TSRawResult>[]) => {
            return forkJoin(callsPerIdentifier)
        })
    ).pipe(
        map((results: TSRawResult[][]) => {
            const allSeries: Series[] = []
            for (const resultsPerIdentifier of results) {
                const seriesMap: Map<string, Series> = new Map();
                
                for (const [index, result] of resultsPerIdentifier.entries()) {
                    const meta = result.meta
                    const local = true
                    const type = (meta.carrier) ? meta.carrier : ''
                    const timeInterval = timeIntervals[index]
                    const seriesKey = toSeriesId(endpointKey, meta.identifier, local, timeInterval.stepUnit)

                    const currentSeries = seriesMap.get(seriesKey)
                    let data: number[][] = []
                    if (currentSeries) {
                        data = currentSeries.data
                    } else {
                        seriesMap.set(seriesKey, {
                            id: seriesKey,
                            name: meta.identifier,
                            type: type,
                            data: data,
                            unit: meta.unit,
                            consumption: meta.consumption,
                            local: local,
                            timeUnit: timeInterval.stepUnit,
                            sourceDataset: endpointKey
                        })
                    }

                    for (const dataPoint of result.datapoints) {
                        data.push([
                            moment(dataPoint.bucket).valueOf(),
                            dataPoint.mean_value,
                        ])
                    }
                }

                const seriesArray = Array.from(seriesMap.values())
                allSeries.push(...seriesArray)
            }
            
            return allSeries
        })
    )

    return answer
}