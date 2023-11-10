import { Component, Input, inject } from '@angular/core';
import { Props } from 'src/app/types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-production-consumption-diagram',
  templateUrl: './production-consumption-diagram.component.html',
  styleUrls: ['./production-consumption-diagram.component.scss']
})
export class ProductionConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};
  kpiService: KpiService = inject(KpiService);

  /*get production(): number[] {
    return this.kpiService.computeProductionKpi();
  }

  get consumption(): number[] {
    return this.kpiService.computeConsumptionKpi();
  }*/
}


