import { Component, Input, inject } from '@angular/core';
import { Props } from 'src/app/types/props';
import { KpiService } from 'src/app/services/kpi.service';

@Component({
  selector: 'app-energy-mix-diagram',
  templateUrl: './energy-mix-diagram.component.html',
  styleUrls: ['./energy-mix-diagram.component.scss']
})
export class EnergyMixDiagramComponent {
  @Input() props: Props = {value: [10,20,30]};
  kpiService: KpiService = inject(KpiService);

  get energyMix(): number[] {
    return this.kpiService.computeEnergyMixKpi();
  }
}


