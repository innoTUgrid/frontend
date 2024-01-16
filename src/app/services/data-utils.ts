import { ArtificialDatasetKey, DatasetKey } from "@app/types/kpi.model";
import { Dataset, Series, TimeInterval, TimeUnit } from "@app/types/time-series-data.model";


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
        })
    }

    return newDataset
}

