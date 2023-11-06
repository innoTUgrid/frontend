import { Component, Input } from '@angular/core';
import { Props } from '../../../types/props';

@Component({
  selector: 'app-kpi-wrapper',
  template: `
    <div class="tiling-container" *ngIf="showKPIs">
    <ng-container *ngFor="let kpi of kpis">
        <app-autarky *ngIf="kpi === 'autarky'" [props]="props"></app-autarky>
        <app-cost-savings *ngIf="kpi === 'cost-savings'" [props]="props"></app-cost-savings>
        <app-co2-savings *ngIf="kpi === 'co2-savings'" [props]="props"></app-co2-savings>
        <app-self-consumption *ngIf="kpi === 'self-consumption'" [props]="props"></app-self-consumption>
    </ng-container>
    </div>
  `,
})
export class KpiWrapperComponent {
  showKPIs = true;
  kpis = ['autarky', 'cost-savings', 'co2-savings', 'self-consumption'];

  @Input() props: Props = {value: 75};
}
