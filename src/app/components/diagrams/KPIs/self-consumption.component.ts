
import { Component, Input } from '@angular/core';
import { Props } from '../../props';

@Component({
  selector: 'app-self-consumption',
  template: '<div>self-consumption:{{ props.value }}</div>',
})
export class SelfConsumptionComponent {
  @Input() props: Props = {value: 75};
}
