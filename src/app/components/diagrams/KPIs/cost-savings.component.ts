import { Component, Input, inject } from '@angular/core';
import { Props } from '../../../types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-cost-savings',
  template: '<div>cost-savings: {{ costSavings }}</div>',
})
export class CostSavingsComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);

  get costSavings(): number {
    return this.kpiService.computeCostSavingsKpi();
  }

}
