import { Component, OnInit, inject } from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { ThemeService } from '@app/services/theme.service';
import { HighchartsDiagramMinimal, SeriesTypes, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Dataset, DatasetRegistry, Series } from '@app/types/time-series-data.model';
import * as Highcharts from 'highcharts/highstock';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

@Component({
    selector: 'app-energy-flow-diagram',
    templateUrl: './energy-flow-diagram.component.html',
    styleUrls: ['./energy-flow-diagram.component.scss']
})
export class EnergyFlowDiagramComponent implements HighchartsDiagramMinimal {
    Highcharts: typeof Highcharts = Highcharts; // required
    dataService: DataService = inject(DataService)
    chartService: ChartService = inject(ChartService)
    themeService: ThemeService = inject(ThemeService)

    readonly id = "EnergyFlow." + Math.random().toString(36).substring(7);

    updateFlag = false
    chart: Highcharts.Chart|undefined

    chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
        this.chart = chart;
    }

    registries: DatasetRegistry[] = [
        {
            id: this.id,
            endpointKey: TimeSeriesEndpointKey.ENERGY_CONSUMPTION,
        },
        {
            id: this.id,
            endpointKey: TimeSeriesEndpointKey.TS_RAW,
        },
    ]
    subscriptions: Subscription[] = [];

    chartProperties: Highcharts.Options = {
        title: {
            text: 'Electricity Flow with the Share of Different Energy Sources'
        },
        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. {point.from} to {point.to}, {point.weight}.'
            }
        },
        tooltip: {
            headerFormat: undefined,
            pointFormat:
          '{point.fromNode.name} \u2192 {point.toNode.name}: {point.weight:.2f} kWh',
            // nodeFormat: '{point.name}: {point.sum:.2f} quads'
        },

        series: [{
            keys: ['from', 'to', 'weight'],
            nodes: [
                {
                    id: 'Solar',
                    colorIndex: 6
                },
                {
                    id: 'Wind',
                    colorIndex: 5
                },
                {
                    id: 'Brown Coal',
                    colorIndex: 7

                },
                {
                    id: 'Biogas',
                    colorIndex: 0
                },
                {
                    id: 'Microgrid 1',
                    colorIndex: 3
                },
                {
                    id: 'Microgrid 2',
                    colorIndex: 3
                },
                {
                    id: 'Microgrid 3',
                    colorIndex: 3
                },
                {
                    id: 'Total Consumption',
                    colorIndex: 2
                }

            ],

            data: [
                { from: 'Solar', to: 'Microgrid 1', weight: 6, colorIndex: 6},
                { from: 'Wind', to: 'Microgrid 1', weight: 2, colorIndex: 5},
                { from: 'Brown Coal', to: 'Microgrid 1', weight: 3, colorIndex: 7},
                { from: 'Biogas', to: 'Microgrid 1', weight: 6, colorIndex: 0},
                { from: 'Solar', to: 'Microgrid 2', weight: 3, colorIndex: 6},
                { from: 'Wind', to: 'Microgrid 2', weight: 1, colorIndex: 5},
                { from: 'Brown Coal', to: 'Microgrid 2', weight: 2, colorIndex: 7},
                { from: 'Biogas', to: 'Microgrid 2', weight: 4, colorIndex: 0},
                { from: 'Solar', to: 'Microgrid 3', weight: 3, colorIndex: 6},
                { from: 'Wind', to: 'Microgrid 3', weight: 1, colorIndex: 5},
                { from: 'Brown Coal', to: 'Microgrid 3', weight: 2, colorIndex: 7},
                { from: 'Biogas', to: 'Microgrid 3', weight: 4, colorIndex: 0},
                { from: 'Microgrid 1', to: 'Total Consumption', weight: 10, colorIndex: 3},
                { from: 'Microgrid 2', to: 'Total Consumption', weight: 10, colorIndex: 3},
                { from: 'Microgrid 3', to: 'Total Consumption', weight: 10, colorIndex: 3},
            ],
            type: 'sankey',
            name: 'Energy Flow'
        }] as Highcharts.SeriesSankeyOptions[],
    
    }

    updateData(datasets: Dataset[]) {
        if (datasets.length < 2) return;
        const consumption = datasets[0]
        const consumptionSeries = this.chartService.filterOtherStepUnits(consumption.series)
        const raw = datasets[1]
        // series.consumption && !series.aggregate && series.local 
        const rawSeries = this.chartService.filterOtherStepUnits(raw.series.filter((series: Series) => series.consumption))

        const consumptionTotalByCarrier = consumptionSeries.map(
            (series: Series) => this.chartService.calculateSingleValue(series.data, false)
        )
        
        const consumptionTotalByConsumer = rawSeries.map(
            (series: Series) => this.chartService.calculateSingleValue(series.data, false)
        )

        const nodes: Highcharts.SeriesSankeyNodesOptionsObject[] = consumptionSeries.map(
            (series: Series) => {return {id:series.name, color: this.themeService.colorMap.get(series.type)}}
        )
        nodes.push({id: 'Heat', colorIndex: 3})
        nodes.push({id: 'Electricity', colorIndex: 3})
        nodes.push(...rawSeries.map(
            (series: Series) => {return {id:series.name, color: this.themeService.colorMap.get(series.type)}}
        ))

        const edges = []
        for (const [index, series] of consumptionSeries.entries()) {
            edges.push({from: series.name, to: 'Heat', weight: consumptionTotalByCarrier[index] * 0.7})
            edges.push({from: series.name, to: 'Electricity', weight: consumptionTotalByCarrier[index] * 0.3})
        }

        for (const [index, series] of rawSeries.entries()) {
            edges.push({from: 'Heat', to: series.name, weight: consumptionTotalByConsumer[index] * 0.7})
            edges.push({from: 'Electricity', to: series.name, weight: consumptionTotalByConsumer[index] * 0.3})
        }

        this.chartProperties.series = [{
            keys: ['from', 'to', 'weight'],
            nodes: nodes,
            data: edges,
            type: 'sankey',
            animation: true,
            name: 'Energy Flow'
        }] as Highcharts.SeriesSankeyOptions[]
        if (this.chart) {
            this.chart.update({
                series: this.chartProperties.series
            }, true, true)
        } else {
            this.updateFlag = true
        }
    }

    constructor() {
    }

    ngOnInit(): void {
        this.registries.forEach((registry) => {
            this.dataService.registerDataset(registry)
        })

        const s = combineLatest(this.registries.map((registry) => this.dataService.getDataset(registry.endpointKey)))
        .subscribe((datasets: Dataset[]) => {
            this.updateData(datasets)
        })

        this.subscriptions.push(s)
    }

    ngOnDestroy(): void {
        this.registries.forEach((registry) => {
            this.dataService.unregisterDataset(registry)
        })

        this.subscriptions.forEach((subscription) => subscription.unsubscribe())
        this.subscriptions = []
    }
}
