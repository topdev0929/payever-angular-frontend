import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-list-item',
  templateUrl: 'list-item.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ListItemComponent {

  @Input() disableRipple: boolean;
}
