
import { Component, Input, inject } from '@angular/core';
import { Props } from '../../../types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-self-consumption',
  template: '<div>self-consumption:{{ selfConsumption }}</div>',
})
export class SelfConsumptionComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);

  get selfConsumption(): number {
    return this.kpiService.computeSelfConsumptionKpi();
  }
}
