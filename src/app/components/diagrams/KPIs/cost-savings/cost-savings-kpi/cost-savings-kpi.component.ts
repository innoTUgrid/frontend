import { Component, OnInit, Input } from '@angular/core';
import { DatasetKey, KPIKey } from '@app/types/kpi.model';

@Component({
  selector: 'app-cost-savings-kpi',
  templateUrl: './cost-savings-kpi.component.html',
  styleUrls: ['./cost-savings-kpi.component.scss']
})
export class CostSavingsKPIComponent implements OnInit{

  kpiName: DatasetKey = KPIKey.COST_SAVINGS;

  constructor() {}

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    // this.kpiService.costSavingsKPI$.subscribe((costSavingsKPI) => {
    //   this.costSavingsKPI = costSavingsKPI;
    // });

    // // Trigger the computation of KPI (for later)
    // this.kpiService.computeCostSavingsKpi();
  }
}
