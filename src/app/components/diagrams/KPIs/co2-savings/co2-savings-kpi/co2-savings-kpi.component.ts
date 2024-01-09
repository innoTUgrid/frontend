import { Component, OnInit, Input } from '@angular/core';
import { DatasetKey, KPIKey } from '@app/types/kpi.model';

@Component({
  selector: 'app-co2-savings-kpi',
  templateUrl: './co2-savings-kpi.component.html',
  styleUrls: ['./co2-savings-kpi.component.scss']
})
export class Co2SavingsKPIComponent implements OnInit {
  
  kpiName: DatasetKey = KPIKey.CO2_SAVINGS;

  constructor() {}

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    // this.kpiService.co2SavingsKPI$.subscribe((co2SavingsKPI) => {
    //   this.co2SavingsKPI = co2SavingsKPI;
    // });

    // // Trigger the computation of KPI (for later)
    // this.kpiService.computeCO2SavingsKpi();
  }
}
