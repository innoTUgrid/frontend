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
    SCOPE_1_EMISSIONS = "kpi/scope_one_emissions",
    SCOPE_2_EMISSIONS = "kpi/scope_two_emissions",
    TS_RAW = 'ts'
}

export enum ArtificialDatasetKey {
    TOTAL_ENERGY_CONSUMPTION = TimeSeriesEndpointKey.ENERGY_CONSUMPTION + "_total",
    TOTAL_EMISSIONS = "emissions_total", // no types
    ALL_SCOPE_EMISIONS_COMBINED = "all_scope_emissions_combined",
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