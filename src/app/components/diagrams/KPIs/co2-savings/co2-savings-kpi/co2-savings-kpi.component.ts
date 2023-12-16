import { Component, OnInit, Input } from '@angular/core';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-co2-savings-kpi',
  templateUrl: './co2-savings-kpi.component.html',
  styleUrls: ['./co2-savings-kpi.component.scss']
})
export class Co2SavingsKPIComponent implements OnInit {

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    // Subscribe to autarkyKPI$ observable to get real-time updates
    // this.kpiService.co2SavingsKPI$.subscribe((co2SavingsKPI) => {
    //   this.co2SavingsKPI = co2SavingsKPI;
    // });

    // // Trigger the computation of KPI (for later)
    // this.kpiService.computeCO2SavingsKpi();
  }
}
