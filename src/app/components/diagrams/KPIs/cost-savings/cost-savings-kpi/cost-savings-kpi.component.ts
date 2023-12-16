import { Component, OnInit, Input } from '@angular/core';
import { KPI } from '@app/types/kpi.model';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-cost-savings-kpi',
  templateUrl: './cost-savings-kpi.component.html',
  styleUrls: ['./cost-savings-kpi.component.scss']
})
export class CostSavingsKPIComponent implements OnInit{

  kpiName: KPI = KPI.COST_SAVINGS;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    // this.kpiService.costSavingsKPI$.subscribe((costSavingsKPI) => {
    //   this.costSavingsKPI = costSavingsKPI;
    // });

    // // Trigger the computation of KPI (for later)
    // this.kpiService.computeCostSavingsKpi();
  }
}
