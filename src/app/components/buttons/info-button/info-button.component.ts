import { Component, Input } from '@angular/core';
import { MtxPopover } from '@ng-matero/extensions/popover';

@Component({
  selector: 'app-info-button',
  templateUrl: './info-button.component.html',
  styleUrls: ['./info-button.component.scss']
})
export class InfoButtonComponent {
  @Input() text?: string;
  @Input({required: true}) popover?: MtxPopover;
}
