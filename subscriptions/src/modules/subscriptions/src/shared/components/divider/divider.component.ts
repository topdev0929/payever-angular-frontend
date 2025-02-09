import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-divider',
  template: ` <div class="divider" [style.margin-left.px]="leftOffset"></div> `,
  styleUrls: ['./divider.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeDividerComponent {
  @Input() leftOffset;
}
