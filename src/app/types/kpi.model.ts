export enum KPIEndpointKey {
    SELF_CONSUMPTION = "kpi/self_consumption",
    AUTARKY = "kpi/autarky",
    COST_SAVINGS = "kpi/cost_savings",
    CO2_SAVINGS = "kpi/co2_savings",
    TOTAL_CONSUMPTION = "kpi/total_consumption",
    TOTAL_PRODUCTION = "kpi/total_production",
    TOTAL_COSTS_PER_KWH = "kpi/total_grid_electricity_cost",
    TOTAL_CO2_EMISSIONS_PER_KWH = "kpi/total_co2_emissions",
}

export enum TimeSeriesEndpointKey {
    ENERGY_CONSUMPTION = "kpi/consumption",
    LOCAL_CONSUMPTION = "kpi/local_consumption",
    SCOPE_1_EMISSIONS = "kpi/scope_one_emissions",
    SCOPE_2_EMISSIONS = "kpi/scope_two_emissions",
    TS_RAW = 'ts',

    // combined datasets
    ALL_SCOPE_EMISSIONS_COMBINED = "all_scope_emissions_combined",
}

export enum ArtificialDatasetKey {
    TOTAL_CONSUMPTION = TimeSeriesEndpointKey.ENERGY_CONSUMPTION + "_total_artificial",
    TOTAL_PRODUCTION = "production_total_artificial",
    TOTAL_EMISSIONS = "emissions_total_artificial", // no types
    ALL_SCOPE_EMISSIONS_MERGED = "all_scope_emissions_merged_artificial",
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
    chart? : Highcharts.Chart
    loading: boolean
}

export type SeriesTypes = "area" | "column" | "line" | "spline" | "solidgauge"
