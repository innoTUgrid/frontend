
import { Component, Input, inject } from '@angular/core';
import { Props } from '../../../types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-co2-savings',
  template: '<div>co2-savings: {{ co2Savings }}</div>',
})
export class CO2SavingsComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);

  get co2Savings(): number {
    return this.kpiService.computeCO2SavingsKpi();
  }
}
