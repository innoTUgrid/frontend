import { HttpClient } from "@angular/common/http";
import { DatasetKey } from "@app/types/kpi.model";
import { KPIResult, Series, TimeInterval, TimeSeriesResult } from "@app/types/time-series-data.model";
import { environment } from "@env/environment";
import { Observable, forkJoin, map } from "rxjs";
import { toSeriesId } from "./data-utils";
import moment from "moment";

export function getURL(endpointKey: DatasetKey): string {
    return `${environment.apiUrl}/v1/kpi/${endpointKey}/`;
}

export function fetchKPIData(http: HttpClient, endpointKey: DatasetKey, timeInterval: TimeInterval): Observable<Series[]> {
    const url = `${environment.apiUrl}/v1/kpi/${endpointKey}/`;
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
                },
            ]

            return series
        })
    )
    return call
}

export function fetchTimeSeriesData(http: HttpClient, endpointKey: DatasetKey, timeIntervals: TimeInterval[], energyTypesToName: Map<string, string>): Observable<Series[]> {
    const url = getURL(endpointKey);

    const calls: Observable<TimeSeriesResult[]>[] = []
    for (const timeInterval of timeIntervals) {
        http.get<TimeSeriesResult[]>(url, {})
        calls.push(
            http.get<TimeSeriesResult[]>(url, {
                params: {
                    from: timeInterval.start.toISOString(),
                    to: timeInterval.end.toISOString(),
                    interval: `1${timeInterval.stepUnit}`
                }
            })
        )
    }
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
                        let name = energyTypesToName.get(carrierName + (entry.local ? '-local' : ''))
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
            return seriesArray
            //   this.insertNewData(localKey, seriesArray, timeIntervals);
        })
    );
    return join;
}