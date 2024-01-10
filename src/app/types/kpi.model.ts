export enum KPIEndpointKey {
    SELF_CONSUMPTION = "self_consumption",
    AUTARKY = "autarky",
    COST_SAVINGS = "cost_savings",
    CO2_SAVINGS = "co2_savings",
}

export enum TimeSeriesEndpointKey {
    ENERGY_CONSUMPTION = "consumption",
    SCOPE_2_EMISSIONS = "scope_two_emissions",
}

export type DatasetKey = KPIEndpointKey | TimeSeriesEndpointKey
export const KPIList: string[] = Object.values(KPIEndpointKey)

export interface DataSubscription {
    onSeriesUpdate?: () => void
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