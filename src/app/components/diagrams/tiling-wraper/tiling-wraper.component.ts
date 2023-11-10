import { Component, Input } from '@angular/core';
import { Props } from 'src/app/types/props';

@Component({
  selector: 'app-tiling-wraper',
  templateUrl: './tiling-wraper.component.html',
  styleUrls: ['./tiling-wraper.component.scss']
})
export class TilingWraperComponent {
  @Input() subComponent: string = 'autarky';

  @Input() props: Props = { value: 60};
}
