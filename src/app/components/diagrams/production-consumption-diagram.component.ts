import { Component, Input, inject } from '@angular/core';
import { Props } from '../../types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-production-consumption-diagram',
  template: '<div>production: {{this.production}} <br> consumption: {{ this.consumption }}</div>',
})
export class ProductionConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);

  get production(): number[] {
    return this.kpiService.computeProductionKpi();
  }

  get consumption(): number[] {
    return this.kpiService.computeConsumptionKpi();
  }
}
