import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_sankey from 'highcharts/modules/sankey';

@Component({
    selector: 'app-energy-flow-diagram',
    templateUrl: './energy-flow-diagram.component.html',
    styleUrls: ['./energy-flow-diagram.component.scss']
})
export class EnergyFlowDiagramComponent {
    Highcharts: typeof Highcharts = Highcharts; // required
    updateFlag = false
    chart: Highcharts.Chart|undefined

    chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
        this.chart = chart;
    }

    chartProperties: Highcharts.Options = {
        title: {
            text: 'Electricity Flow with share of different energy sources'
        },
        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. {point.from} to {point.to}, {point.weight}.'
            }
        },
        credits: {enabled:false},
        tooltip: {
            headerFormat: undefined,
            pointFormat:
          '{point.fromNode.name} \u2192 {point.toNode.name}: {point.weight:.2f} quads',
            // nodeFormat: '{point.name}: {point.sum:.2f} quads'
        },

        series: [{
            keys: ['from', 'to', 'weight'],
            nodes: [
                {
                    id: 'Solar',
                    colorIndex: 5
                },
                {
                    id: 'Wind',
                    colorIndex: 4
                },
                {
                    id: 'Brown Coal',
                    colorIndex: 9

                },
                {
                    id: 'Biomass',
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
                { from: 'Solar', to: 'Microgrid 1', weight: 6, colorIndex: 5},
                { from: 'Wind', to: 'Microgrid 1', weight: 2, colorIndex: 4},
                { from: 'Brown Coal', to: 'Microgrid 1', weight: 3, colorIndex: 9},
                { from: 'Biomass', to: 'Microgrid 1', weight: 6, colorIndex: 0},
                { from: 'Solar', to: 'Microgrid 2', weight: 3, colorIndex: 5},
                { from: 'Wind', to: 'Microgrid 2', weight: 1, colorIndex: 4},
                { from: 'Brown Coal', to: 'Microgrid 2', weight: 2, colorIndex: 9},
                { from: 'Biomass', to: 'Microgrid 2', weight: 4, colorIndex: 0},
                { from: 'Solar', to: 'Microgrid 3', weight: 3, colorIndex: 5},
                { from: 'Wind', to: 'Microgrid 3', weight: 1, colorIndex: 4},
                { from: 'Brown Coal', to: 'Microgrid 3', weight: 2, colorIndex: 9},
                { from: 'Biomass', to: 'Microgrid 3', weight: 4, colorIndex: 0},
                { from: 'Microgrid 1', to: 'Total Consumption', weight: 10, colorIndex: 3},
                { from: 'Microgrid 2', to: 'Total Consumption', weight: 10, colorIndex: 3},
                { from: 'Microgrid 3', to: 'Total Consumption', weight: 10, colorIndex: 3},
                // { from: 'Total Consumption', to: 'Consumer 1', weight: 2 },
                // { from: 'Total Consumption', to: 'Consumer 2', weight: 6 },
                // { from: 'Total Consumption', to: 'Consumer 3', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 4', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 5', weight: 2 },
                // { from: 'Total Consumption', to: 'Consumer 6', weight: 2 },
                // { from: 'Total Consumption', to: 'Consumer 7', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 8', weight: 4 },
                // { from: 'Total Consumption', to: 'Consumer 9', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 10', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 11', weight: 3 },
                // { from: 'Total Consumption', to: 'Consumer 12', weight: 2 },
                // { from: 'Total Consumption', to: 'Consumer 13', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 14', weight: 1 },
                // { from: 'Total Consumption', to: 'Consumer 15', weight: 2 },
            ],
            type: 'sankey',
            name: 'Energy Flow'
        }] as Highcharts.SeriesSankeyOptions[],
    
    }

    constructor() {
        HC_sankey(Highcharts);
    }

}
