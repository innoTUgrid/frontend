import { Component, Input, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { HighchartsDiagram, DatasetKey, SeriesTypes, SingleValueDiagram, KPIEndpointKey } from 'src/app/types/kpi.model';
import { Subscription } from 'rxjs';
import { DataService } from '@app/services/data.service';
import { ChartService } from '@app/services/chart.service';
import { DatasetRegistry } from '@app/types/time-series-data.model';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-percent-chart',
    templateUrl: './percent-chart.component.html',
    styleUrls: ['./percent-chart.component.scss'],
})
export class PercentChartComponent implements HighchartsDiagram, SingleValueDiagram {
    chartService: ChartService = inject(ChartService);
    dataService: DataService = inject(DataService);
    themeService: ThemeService = inject(ThemeService);
    color = this.themeService.kpiColor;
    _value: number = 0;
    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
        this.updateChart()
    }

    set loading(value: boolean) {
        if (this.chart) {
            if (value) {
                this.chart.showLoading()
            } else {
                this.chart.hideLoading()
            }
        }
    }

    _kpiName?: DatasetKey;
  readonly id = "PercentChartComponent." + Math.random().toString(36).substring(7);
    subscriptions: Subscription[] = [];

    @Input() set kpiName(value: DatasetKey | undefined) {
        this._kpiName = value;
        if (value) {
            this.registry.endpointKey = value;
            this.dataService.registerDataset(this.registry)
            this.subscriptions = this.chartService.subscribeSingleValueDiagram(this, value);
        }
    }

    get kpiName(): DatasetKey | undefined {  
        return this._kpiName;
    }

    registry: DatasetRegistry = {
        id:this.id,
        endpointKey: KPIEndpointKey.AUTARKY,
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
    xAxis: Highcharts.XAxisOptions[] = [{
        min: 0,
        max: 1,
        minorTickInterval: null,
        visible: false,
        
        labels: {
            enabled: false,
            formatter: function () {
                const number = Number.parseFloat(this.value.toString())
                return (number * 100).toString();
            },
        },
    }]

    dataGrouping: Highcharts.DataGroupingOptionsObject = {
        approximation: 'average',
        enabled: true,
        forced: true,
        groupAll: true,
      }
    updateFlag: boolean = false;
    seriesType: SeriesTypes = "solidgauge";
    
    get series(): Highcharts.SeriesOptionsType[] {
        if (isNaN(this.value)) return []
        return [{
            id: 'main',
            type: this.seriesType,
            name: this.title,
            data: [{
                y: this.value,
            }],
            color: this.color,
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
                borderWidth: 0,
                backgroundColor: '#F5F5F5',
            }]
        },

        yAxis:this.xAxis,
    
        plotOptions: {
            solidgauge: {
                colorByPoint: false,
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
            
            }
        },
        exporting: {enabled: false},
        series: this.series
    }

    chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
        this.chart = chart;
        this.updateChart()
    }

    updateChart() {
        if (this.chart) {

            this.chart.update({
                title: this.chartProperties.title,
                series: this.series,
            }, true, true, true)
        } else {
            this.chartProperties.title = this.chartProperties.title
            this.chartProperties.series = this.series
            this.updateFlag = true
        }
    }

    ngOnDestroy(): void {
        this.unsubscribeAll()
        this.dataService.unregisterDataset(this.registry)
    }

    ngOnInit(): void {
    }
    
    unsubscribeAll() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.subscriptions = [];
    }
    
    constructor() {
    }
    
}
