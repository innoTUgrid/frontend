export enum KPI {
    ENERGY_CONSUMPTION = "consumption",
    AUTARKY = "autarky",
    SELF_CONSUMPTION = "self_consumption",
    COST_SAVINGS = "cost_savings",
    CO2_SAVINGS = "co2_savings",
    SCOPE_2_EMISSIONS = "scope_two_emissions",
}

export interface DataSubscription {
    onSeriesUpdate?: () => void
    kpiName?: KPI
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