import { Component, Input, OnInit } from '@angular/core';
import { Props } from 'src/app/types/props';
import { KpiService } from 'src/app/services/kpi.service';

import * as Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsData from 'highcharts/modules/data';
import HighchartsAccessibility from 'highcharts/modules/accessibility';



HighchartsExporting(Highcharts);
HighchartsData(Highcharts);
HighchartsAccessibility(Highcharts);

@Component({
  selector: 'app-energy-mix-diagram',
  templateUrl: './energy-mix-diagram.component.html',
  styleUrls: ['./energy-mix-diagram.component.scss']
})
export class EnergyMixDiagramComponent implements OnInit{
  @Input() props: Props = { value: [10, 20, 30] };
  kpiService: KpiService;

  constructor(kpiService: KpiService) {
    this.kpiService = kpiService;
  }

  ngOnInit() {
    this.initChart();
  }

  private initChart() {
    const energyMixData = this.kpiService.computeEnergyMixKpi();
  
    Highcharts.chart({
      chart: {
        type: 'area',
        renderTo: 'energyMixChart',
      },
      title: {
        text: 'Energy-mix',
        align: 'center',
      },

      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yAxis: {
        title: {
          text: 'CO2 Emissions',
        },
      },
      series: [
        {
          name: 'Total',
          type: 'area', // Specify the type for each series
          data: [
            38000 + 22534,
            37300 + 23599,
            37892 + 24533,
            38564 + 25195,
            36770 + 25896,
            36026 + 27635,
            34978 + 29173,
            35657 + 32646,
            35620 + 35686,
            35971 + 37709,
            36409 + 39143,
            36435 + 36829,    
        ]
        },
        {
          name: 'Scope 1',
          type: 'area', // Specify the type for each series
          data: [
            38000,
            37300,
            37892,
            38564,
            36770,
            36026,
            34978,
            35657,
            35620,
            35971,
            36409,
            36435,
        ],
        },
        {
          name: 'Scope 2',
          type: 'area', // Specify the type for each series
          data: [
                22534,
                23599,
                24533,
                25195,
                25896,
                27635,
                29173,
                32646,
                35686,
                37709,
                39143,
                36829,
            ],
        },
      ],

    });
  }
  
  

}
