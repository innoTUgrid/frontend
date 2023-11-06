import { Component, Input } from '@angular/core';
import { Props } from '../../../types/props';

@Component({
  selector: 'app-cost-savings',
  template: '<div>cost-savings: {{ props.value }}</div>',
})
export class CostSavingsComponent {
  @Input() props: Props = {value: 75};
}
