export enum KPI {
    ENERGY_CONSUMPTION = "energyConsumption",
    AUTARKY = "autarky",
    SELF_CONSUMPTION = "selfConsumption"
}

export interface HighchartsDiagram {
    chart: Highcharts.Chart|undefined
    chartProperties: Highcharts.Options
    xAxis: Highcharts.XAxisOptions
    dataGrouping: Highcharts.DataGroupingOptionsObject
    updateFlag: boolean
    seriesType: SeriesTypes
    colors: string[]
    onSeriesUpdate?: () => void
}

export interface SingleValueDiagram {
    value: number
}

export type SeriesTypes = "area" | "column" | "line" | "spline" | "solidgauge"