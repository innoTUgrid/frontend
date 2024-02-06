import { MetaInfo } from "@app/types/api-result.model";
import { ArtificialDatasetKey, DatasetKey } from "@app/types/kpi.model";
import { Dataset, Series, TimeInterval, TimeUnit } from "@app/types/time-series-data.model";
import moment from "moment";


export function toSeriesId(endpoint: string, type: string, local: boolean, timeUnit:TimeUnit): string {
    return `${endpoint}.${type}.${local ? 'local' : 'external'}.${timeUnit}`
}

export function filterTimeUnits(series: Series[]): Set<TimeUnit> {
  const timeUnits = new Set<TimeUnit>();
  series.forEach((s) => {
    timeUnits.add(s.timeUnit);
  });
  return timeUnits;

}

export function largestTimeInterval(metaInfo: MetaInfo[]): TimeInterval {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    for (const meta of metaInfo) {
        const min_timestamp = moment(meta.min_timestamp)
        const max_timestamp = moment(meta.max_timestamp)
        if (min_timestamp.isBefore(min)) min = min_timestamp.valueOf()
        if (max_timestamp.isAfter(max)) max = max_timestamp.valueOf()
    }

    return {start: moment(min), end: moment(max), step: 1, stepUnit: TimeUnit.HOUR} as TimeInterval
}

export function timeIntervalEquals(a: TimeInterval, b: TimeInterval): boolean {
    return a.start.isSame(b.start) && a.end.isSame(b.end) && a.stepUnit === b.stepUnit
}
  
export function timeIntervalValid(interval: Partial<TimeInterval>): boolean {
    return interval.start !== undefined && interval.end !== undefined && interval.step !== undefined && interval.stepUnit !== undefined
        && interval.start.isValid() && interval.end.isValid() && interval.step > 0 && Object.values(TimeUnit).includes(interval.stepUnit)
        && interval.start.isSameOrBefore(interval.end)
}

export function timeIntervalIncludes(larger: TimeInterval, smaller: TimeInterval): boolean {
    return larger.start.isSameOrBefore(smaller.start) && larger.end.isSameOrAfter(smaller.end) && larger.stepUnit === smaller.stepUnit
}

export function sortedMerge(
    a: number[][], 
    b: number[][], 
    equalValuesCombiner: (values: number[]) => number = (values) => values[0]
    ): number[][] {
        const data = []
        let i = 0
        let j = 0
        while (i < a.length && j < b.length) {
            if (a[i][0] < b[j][0]) { // a smaller
                data.push(a[i++])
            } else if (b[j][0] < a[i][0]) { // b smaller
                data.push(b[j++])
            } else { // if equal, then filter out duplicates and always take the value of a
                const value = a[i++]
                const values = [value[1]]
                
                while (i < a.length && a[i][0] === value[0]) values.push(a[i++][1])
                while (j < b.length && b[j][0] === value[0]) values.push(b[j++][1])

                data.push([value[0], equalValuesCombiner(values)])
            }
        }

        while (i < a.length) data.push(a[i++])
        while (j < b.length) data.push(b[j++])

        return data
}

export function sumAllDataTypes(data: Series[], interval?: TimeInterval): number[][] {
    let relevantSeries: Series[] = data
    if (interval) relevantSeries = data.filter(series => series.timeUnit === interval.stepUnit)

    const dataMap = new Map<number, number>()
    for (const series of relevantSeries) {
        let i = 0;
        const data_len = series.data.length

        while (i < data_len) { // using this type of loop for performance reasons
        const point = series.data[i]
        if (!interval || (point[0] >= interval.start.valueOf() && point[0] <= interval.end.valueOf())) {
            const value = dataMap.get(point[0])
            if (value) {
            dataMap.set(point[0], value + point[1])
            } else {
            dataMap.set(point[0], point[1])
            }
        }

        i++;
        }
    }

    const newDatapoints = Array.from(dataMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => [entry[0], entry[1]])
    return newDatapoints
}

export function mergeDatasets(datasets: Dataset[]): Dataset {
    const seriesMap: Map<string, Series> = new Map()
    for (const series of datasets.map(d => d.series).flat()) {
        const currentSeries = seriesMap.get(series.id)
        if (!currentSeries) {
            seriesMap.set(series.id, {...series})
        } else {
            currentSeries.data = sortedMerge(currentSeries.data, series.data, (values) => values.reduce((a, b) => a + b, 0))
        }
    }

    const newDataset: Dataset = {
        // filter out duplicate timeIntervals
        timeIntervals: datasets.map((d) => d.timeIntervals).flat().filter((interval, index, self) => self.findIndex((i) => timeIntervalEquals(i, interval)) === index), 
        series: Array.of(...seriesMap.values())
    }
    return newDataset
}

export function toDatasetTotal(dataset: Dataset, datasetKey: DatasetKey, name: string, type: string): Dataset {
    const timeUnits = filterTimeUnits(dataset.series)
    const newDataset: Dataset = {timeIntervals: dataset.timeIntervals, series:[]}

    for (const timeUnit of timeUnits) {
        const dataFiltered = dataset.series.filter(series => series.timeUnit === timeUnit)
        const unit = dataFiltered.every(series => series.unit === dataFiltered[0].unit) ? dataFiltered[0].unit : undefined
        const consumption = dataFiltered.every(series => series.consumption === dataFiltered[0].consumption) ? dataFiltered[0].consumption : undefined
        const local = dataFiltered.every(series => series.local === dataFiltered[0].local) ? dataFiltered[0].local : undefined
        const dataSummed = sumAllDataTypes(dataFiltered)
        newDataset.series.push({
            id: toSeriesId(datasetKey, 'total', false, timeUnit),
            name: name,
            type: type,
            data: dataSummed,
            timeUnit: timeUnit,
            unit: unit,
            consumption: consumption,
            local: local,
            sourceDataset: datasetKey
        })
    }

    return newDataset
}

