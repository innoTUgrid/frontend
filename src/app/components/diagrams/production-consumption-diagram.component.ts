import { Component, Input } from '@angular/core';
import { Props } from '../props';

@Component({
  selector: 'app-production-consumption-diagram',
  template: '<div>production and consumption: {{ props.value }}</div>',
})
export class ProductionConsumptionDiagramComponent {
  @Input() props: Props = {value: 75};
}
