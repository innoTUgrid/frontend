import { Component, Input } from '@angular/core';
import { Props } from '../../types/props';

@Component({
  selector: 'app-energy-mix-diagram',
  template: '<div>energy mix: {{ props.value }}</div>',
})
export class EnergyMixDiagramComponent {
  @Input() props: Props = {value: [10,20,30]};
}
