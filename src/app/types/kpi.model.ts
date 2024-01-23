export enum KPIEndpointKey {
    SELF_CONSUMPTION = "kpi/self_consumption",
    AUTARKY = "kpi/autarky",
    COST_SAVINGS = "kpi/cost_savings",
    CO2_SAVINGS = "kpi/co2_savings",
    TOTAL_CONSUMPTION = "kpi/total_consumption",
    TOTAL_PRODUCTION = "kpi/total_production",
    TOTAL_COSTS_PER_KWH = "kpi/total_costs",
    TOTAL_CO2_EMISSIONS_PER_KWH = "kpi/total_co2",
}

export enum TimeSeriesEndpointKey {
    ENERGY_CONSUMPTION = "kpi/consumption",
    SCOPE_2_EMISSIONS = "kpi/scope_two_emissions",
    TS_RAW = 'ts'
}

export enum ArtificialDatasetKey {
    ENERGY_CONSUMPTION_TOTAL = TimeSeriesEndpointKey.ENERGY_CONSUMPTION + "_total",
    EMISSIONS_TOTAL = "emissions_total",
}

export type EndpointKey = KPIEndpointKey | TimeSeriesEndpointKey
export type DatasetKey = EndpointKey | ArtificialDatasetKey
export const KPIList: string[] = Object.values(KPIEndpointKey)

export interface DataSubscription {
    onSeriesUpdate?: () => void
}

export interface HighchartsDiagramMinimal extends DataSubscription {
    chart: Highcharts.Chart|undefined
    chartProperties: Highcharts.Options
    updateFlag: boolean
}

export interface HighchartsDiagram extends HighchartsDiagramMinimal {
    xAxis: Highcharts.XAxisOptions[]
    dataGrouping: Highcharts.DataGroupingOptionsObject
    seriesType: SeriesTypes
}

export interface SingleValueDiagram extends DataSubscription {
    value: number | number[]
}

export type SeriesTypes = "area" | "column" | "line" | "spline" | "solidgauge"