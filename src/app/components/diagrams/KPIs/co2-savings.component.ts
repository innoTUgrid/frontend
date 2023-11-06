
import { Component, Input } from '@angular/core';
import { Props } from '../../../types/props';

@Component({
  selector: 'app-co2-savings',
  template: '<div>co2-savings: {{ props.value }}</div>',
})
export class CO2SavingsComponent {
  @Input() props: Props = {value: 75};
}
