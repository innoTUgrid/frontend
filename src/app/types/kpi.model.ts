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
    TOTAL_CONSUMPTION = TimeSeriesEndpointKey.ENERGY_CONSUMPTION + "_total_artificial",
    TOTAL_PRODUCTION = "production_total_artificial",
    TOTAL_EMISSIONS = "emissions_total_artificial", // no types
    ALL_SCOPE_EMISIONS_COMBINED = "all_scope_emissions_combined_artificial",
}

export type EndpointKey = KPIEndpointKey | TimeSeriesEndpointKey
export type DatasetKey = EndpointKey | ArtificialDatasetKey
export const KPIList: string[] = Object.values(KPIEndpointKey)

export interface HighchartsDiagramMinimal {
    chart: Highcharts.Chart|undefined
    chartProperties: Highcharts.Options
    updateFlag: boolean
}

export interface HighchartsDiagram extends HighchartsDiagramMinimal {
    xAxis: Highcharts.XAxisOptions[]
    dataGrouping: Highcharts.DataGroupingOptionsObject
    seriesType: SeriesTypes
}

export interface SingleValueDiagram {
    value: number | number[]
}

export type SeriesTypes = "area" | "column" | "line" | "spline" | "solidgauge"