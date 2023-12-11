import { Component, Input, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';
import { KpiService } from 'src/app/services/kpi.service';
import { HighchartsDiagram, KPI, SeriesTypes } from 'src/app/types/kpi.model';
import { TimeSeriesDataDictionary } from 'src/app/types/time-series-data.model';
HighchartsMore(Highcharts);
SolidGauge(Highcharts);

@Component({
    selector: 'app-percent-chart',
    templateUrl: './percent-chart.component.html',
    styleUrls: ['./percent-chart.component.scss'],
})
export class PercentChartComponent implements HighchartsDiagram {
    kpiService: KpiService = inject(KpiService);
    _value: number = 0;
    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
        this.updateChart()
    }

    @Input() kpiName: KPI = KPI.AUTARKY;

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
    chart: Highcharts.Chart | undefined
    xAxis: Highcharts.XAxisOptions = {
        min: 0,
        max: 1,
        minorTickInterval: null,

        
        labels: {
            enabled: false,
            formatter: function () {
                const number = Number.parseFloat(this.value.toString())
                return (number * 100).toString();
            },
        },
    }

    dataGrouping: Highcharts.DataGroupingOptionsObject = {
        approximation: 'average',
        enabled: true,
        forced: true,
        groupAll: true,
      }
    updateFlag: boolean = false;
    seriesType: SeriesTypes = "solidgauge";
    colors: string[] = [];
    
    get series(): Highcharts.SeriesOptionsType[] {
        return [{
            id: 'main',
            type: this.seriesType,
            name: this.title,
            data: [{
                y: (isNaN(this.value)) ? 0 : this.value,
            }],
        }]
    }

    chartProperties: Highcharts.Options = {
        chart: {
            type: 'solidgauge',
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

        yAxis:this.xAxis,
    
        plotOptions: {
            solidgauge: {
                
                dataLabels: {
                    enabled: true,
                    align: 'center',
                    borderWidth: 0,
                    verticalAlign: 'middle',
                    y: 0,
                    formatter: function () {
                        if (this.y) {
                            return Math.round(this.y * 100) + ' %'
                        }
                        return this.y
                    },
                    style: {
                        fontSize: '2em'
                    }
                },
                linecap: 'round',
                stickyTracking: false,
                rounded: true,
                radius: '112%',
                innerRadius: '88%',
                colorIndex: 0,
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
        if (this.chart) {

            this.chart?.update({
                title: this.chartProperties.title,
                series: this.series,
            }, true, true, true)
        } else {
            this.chartProperties.title = this.chartProperties.title
            this.chartProperties.series = this.series
            this.updateFlag = true
        }
    }

    constructor() {
        this.kpiService.subscribeSingleValueDiagram(this, this.kpiName);
    }
    
}
