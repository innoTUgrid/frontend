
import { Component, Input, inject } from '@angular/core';
import { Props } from '../../../types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-autarky',
  template: '<div>autarky: {{ autarky }}</div>',
})
export class AutarykComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);

  get autarky(): number {
    return this.kpiService.computeAutarkyKpi();
  }
}
