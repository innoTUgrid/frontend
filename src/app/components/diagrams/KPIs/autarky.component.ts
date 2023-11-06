
import { Component, Input } from '@angular/core';
import { Props } from '../../../types/props';

@Component({
  selector: 'app-autarky',
  template: '<div>autarky: {{ props.value }}</div>',
})
export class AutarykComponent {
  @Input() props: Props = {value: 75};
}
