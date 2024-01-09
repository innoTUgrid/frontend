export enum KPIKey {
    SELF_CONSUMPTION = "self_consumption",
    AUTARKY = "autarky",
    COST_SAVINGS = "cost_savings",
    CO2_SAVINGS = "co2_savings",
}

export enum TimeSeriesKey {
    ENERGY_CONSUMPTION = "consumption",
    SCOPE_2_EMISSIONS = "scope_two_emissions",
}

export type DatasetKey = KPIKey | TimeSeriesKey

export interface DataSubscription {
    onSeriesUpdate?: () => void
    kpiName?: DatasetKey
}

export interface HighchartsDiagram extends DataSubscription {
    chart: Highcharts.Chart|undefined
    chartProperties: Highcharts.Options
    xAxis: Highcharts.XAxisOptions
    dataGrouping: Highcharts.DataGroupingOptionsObject
    updateFlag: boolean
    seriesType: SeriesTypes
}

export interface SingleValueDiagram extends DataSubscription {
    value: number
}

export type SeriesTypes = "area" | "column" | "line" | "spline" | "solidgauge"