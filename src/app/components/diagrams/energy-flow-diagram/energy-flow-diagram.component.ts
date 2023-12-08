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

    chartProperties: any = {
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
            nodeFormat: '{point.name}: {point.sum:.2f} quads'
        },
        series: [{
            keys: ['from', 'to', 'weight'],
    
            data: [
                ['Solar', 'Microgrid 1', 3],
                ['Wind', 'Microgrid 1', 1],
                ['Coal', 'Microgrid 1', 2],
                ['Biomass', 'Microgrid 1', 4],


                ['Solar', 'Microgrid 2', 3],
                ['Wind', 'Microgrid 2', 1],
                ['Coal', 'Microgrid 2', 2],
                ['Biomass', 'Microgrid 2', 4],


                ['Solar', 'Microgrid 3', 3],
                ['Wind', 'Microgrid 3', 1],
                ['Coal', 'Microgrid 3', 2],
                ['Biomass', 'Microgrid 3', 4],

                ['Microgrid 1', 'Total Consumption', 10],
                ['Microgrid 2', 'Total Consumption', 10],
                ['Microgrid 3', 'Total Consumption', 10],

                ['Total Consumption', 'Consumer 1', 2],
                ['Total Consumption', 'Consumer 2', 6],
                ['Total Consumption', 'Consumer 3', 1],
                ['Total Consumption', 'Consumer 4', 1],
                ['Total Consumption', 'Consumer 5', 2],
                ['Total Consumption', 'Consumer 6', 2],
                ['Total Consumption', 'Consumer 7', 1],
                ['Total Consumption', 'Consumer 8', 4],
                ['Total Consumption', 'Consumer 9', 1],
                ['Total Consumption', 'Consumer 10', 1],
                ['Total Consumption', 'Consumer 11', 3],
                ['Total Consumption', 'Consumer 12', 2],
                ['Total Consumption', 'Consumer 13', 1],
                ['Total Consumption', 'Consumer 14', 1],
                ['Total Consumption', 'Consumer 15', 2],

            ],
            type: 'sankey',
            name: 'Energy Flow'
        }]
    
    }

    constructor() {
        HC_sankey(Highcharts);
    }

}
