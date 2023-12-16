import { Component, OnInit, Input } from '@angular/core';
import { KpiService } from 'src/app/services/kpi.service';
import { KPI } from 'src/app/types/kpi.model';

@Component({
  selector: 'app-self-consumption-kpi',
  templateUrl: './self-consumption-kpi.component.html',
  styleUrls: ['./self-consumption-kpi.component.scss']
})
export class SelfConsumptionKPIComponent implements OnInit{
  selfConsumptionKPI: number = 0;
  kpiName: KPI = KPI.SELF_CONSUMPTION;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    // this.kpiService.selfConsumptionKPI$.subscribe((selfConsumptionKPI) => {
    //   this.selfConsumptionKPI = selfConsumptionKPI;
    // });

    // // Trigger the computation of KPI (for later)
    // this.kpiService.computeSelfConsumptionKpi();
  }
}
