export enum KPI {
    ENERGY_CONSUMPTION = "energyConsumption",
    AUTARKY = "autarky",
}

export interface HighchartsDiagram {
    chart: Highcharts.Chart|undefined
    chartProperties: Highcharts.Options
    xAxis: Highcharts.XAxisOptions
    dataGrouping: Highcharts.DataGroupingOptionsObject
    updateFlag: boolean
    seriesType: SeriesTypes
    colors: string[]
}

export interface SingleValueDiagram extends HighchartsDiagram {
    value: number
}

export type SeriesTypes = "area" | "column" | "line" | "spline" | "solidgauge"