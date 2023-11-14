import { Component, Input } from '@angular/core';
import { Props } from 'src/app/types/props';

@Component({
  selector: 'app-kpi-wrapper',
  templateUrl: './kpi-wrapper.component.html',
  styleUrls: ['./kpi-wrapper.component.scss']
})
export class KpiWrapperComponent {
  @Input() props: Props = {value: 75};

  showKPIs = true;
  kpis = ['self-consumption', 'autarky', 'co2-savings', 'cost-savings'];
}
