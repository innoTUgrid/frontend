import { Component, OnInit, inject } from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { ThemeService } from '@app/services/theme.service';
import { HighchartsDiagramMinimal, SeriesTypes, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { DataTypes, Dataset, DatasetRegistry, Series } from '@app/types/time-series-data.model';
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
    }

    updateData(datasets: Dataset[]) {
        if (datasets.length < 2) return;
        const consumption = datasets[0]
        const consumptionSeries = this.chartService.filterOtherStepUnits(consumption.series)
        const raw = datasets[1]
        // series.consumption && !series.aggregate && series.local 
        const rawSeries = this.chartService.filterOtherStepUnits(raw.series.filter((series: Series) => series.consumption && series.name.includes('trafo')))

        const consumptionTotalByCarrier = consumptionSeries.map(
            (series: Series) => this.chartService.calculateSingleValue(series.data, false)
        )
        
        const consumptionTotalByConsumer = rawSeries.map(
            (series: Series) => this.chartService.calculateSingleValue(series.data, false)
        )

        const nodes: Highcharts.SeriesSankeyNodesOptionsObject[] = consumptionSeries.map(
            (series: Series) => {
                const colorIndex = this.themeService.colors.indexOf(series.color || '')
                return {id:series.name, colorIndex: colorIndex}
            }
        )
        nodes.push({id: 'Heat', colorIndex: 3})
        nodes.push({id: 'Electricity', colorIndex: 3})
        nodes.push(...rawSeries.map(
            (series: Series) => {return {id:series.name}}
        ))

        const edges: Highcharts.SeriesSankeyPointOptionsObject[] = []
        for (const [index, series] of consumptionSeries.entries()) {
            const colorIndex = this.themeService.colors.indexOf(series.color || '')
            if (series.type === DataTypes.BIOGAS) {
                edges.push({from: series.name, to: 'Electricity', weight: consumptionTotalByCarrier[index] * 0.3, colorIndex: colorIndex})
                edges.push({from: series.name, to: 'Heat', weight: consumptionTotalByCarrier[index] * 0.7, colorIndex: colorIndex})
            } else {
                edges.push({from: series.name, to: 'Electricity', weight: consumptionTotalByCarrier[index], colorIndex: colorIndex})
            }
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
