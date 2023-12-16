import { Component, Input, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';
import NoData from 'highcharts/modules/no-data-to-display'
import { KpiService } from 'src/app/services/kpi.service';
import { HighchartsDiagram, KPI, SeriesTypes, SingleValueDiagram } from 'src/app/types/kpi.model';
HighchartsMore(Highcharts);
SolidGauge(Highcharts);
NoData(Highcharts);

@Component({
    selector: 'app-percent-chart',
    templateUrl: './percent-chart.component.html',
    styleUrls: ['./percent-chart.component.scss'],
})
export class PercentChartComponent implements HighchartsDiagram, SingleValueDiagram {
    kpiService: KpiService = inject(KpiService);
    _value: number = 0;
    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
        this.updateChart()
    }

    _kpiName?: KPI;

    @Input() set kpiName(value: KPI | undefined) {
        this._kpiName = value;
        if (value) {
           this.kpiService.fetchKPIData(value, this.kpiService.timeInterval)
        }
    }

    get kpiName(): KPI | undefined {  
        return this._kpiName;
    }

    @Input() set title(value: string) {
        if (this.chartProperties) {
            if (!this.chartProperties.title) {
                this.chartProperties.title = {};
            }
            this.chartProperties.title.text = value;
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
        if (isNaN(this.value)) return []
        return [{
            id: 'main',
            type: this.seriesType,
            name: this.title,
            data: [{
                y: this.value,
            }],
        }]
    }

    chartProperties: Highcharts.Options = {
        chart: {
            type: 'solidgauge',
        },
    
        title: {
            text: '',
            style: {
                fontSize: '1em',
            },
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
        this.kpiService.subscribeSingleValueDiagram(this);
    }
    
}
