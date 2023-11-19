import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';
HighchartsMore(Highcharts);
SolidGauge(Highcharts);

@Component({
    selector: 'app-percent-chart',
    templateUrl: './percent-chart.component.html',
    styleUrls: ['./percent-chart.component.scss'],
})
export class PercentChartComponent {
    _value: number = 0;
    @Input() set value(val: number) {
        this._value = val;
        this.updateChart();
    }
    get value(): number { return this._value }

    @Input() set title(value: string) {
        if (this.chartProperties) {
            if (!this.chartProperties.title) {
                this.chartProperties.title = {};
            }
            this.chartProperties.title.text = value;
            this.series[0].name = value;
            this.updateChart();
        }
    }

    get title(): string {
        if (this.chartProperties && this.chartProperties.title && this.chartProperties.title.text !== undefined) {
            return this.chartProperties.title.text;
        } 
        return '';
    }

    Highcharts: typeof Highcharts = Highcharts; // required
    chart?: Highcharts.Chart

    get series(): Highcharts.SeriesSolidgaugeOptions[] {
        return [{
            id: 'main',
            type: 'solidgauge',
            name: this.title,
            data: [{
                radius: '112%',
                innerRadius: '88%',
                y: this.value,
                colorIndex: 0
            }],
        }]
    } 

    chartProperties: Highcharts.Options = {

        chart: {
            type: 'solidgauge',
            styledMode: true,
        },
    
        title: {
            text: '',
            verticalAlign: 'bottom'
        },
    
        tooltip: {
            enabled: false
        },

        pane: {
            startAngle: 0,
            endAngle: 360,
            background: [{ // Track for Conversion
                outerRadius: '112%',
                innerRadius: '88%',
                borderWidth: 0
            }]
        },
    
        yAxis: {
            min: 0,
            max: 100,
            lineWidth: 0,
            tickPositions: []
        },
    
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: true,
                    align: 'center',
                    borderWidth: 0,
                    verticalAlign: 'middle',
                    y: 0,
                    format: '<h1>{y} %</h1>',
                    useHTML: true
                },
                linecap: 'round',
                stickyTracking: false,
                rounded: true
            }
        },
        credits: {enabled: false},
        series: this.series
    }

    chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
        this.chart = chart;
        this.updateChart()
    }

    updateChart() {
        if (this.chartProperties.series && this.chartProperties.series[0]) {

            this.chart?.update({
                title: this.chartProperties.title,
                series: this.series,
            })
        }
    }

    constructor() { }
}
