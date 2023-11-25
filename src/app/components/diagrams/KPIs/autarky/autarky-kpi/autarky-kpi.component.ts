import { Component, OnInit, Input } from '@angular/core';
import { KpiService } from 'src/app/services/kpi.service';
import { Props } from 'src/app/types/props';

@Component({
  selector: 'app-autarky-kpi',
  templateUrl: './autarky-kpi.component.html',
  styleUrls: ['./autarky-kpi.component.scss'],
})
export class AutarkyKPIComponent implements OnInit{
  @Input() props: Props = {value: 75};
  autarkyKPI: number = 80;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    // this.kpiService.timeSeriesDataFiltered$.subscribe((autarkyKPI) => {
    //   this.autarkyKPI = autarkyKPI;
    // });

    // // Trigger the computation of autarkyKPI (for later)
    // this.kpiService.computeAutarkyKpi();
  }
}
