import { Component, Input } from '@angular/core';
import {Props} from './props';

@Component({
  selector: 'app-tiling-wrapper',
  templateUrl: './tiling-wrapper.component.html',
})
export class TilingWrapperComponent {
  @Input() subComponent: string = 'autarky';

  @Input() props: Props = { value: 60};
}
