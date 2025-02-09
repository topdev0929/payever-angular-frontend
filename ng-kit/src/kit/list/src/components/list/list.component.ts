import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-list',
  templateUrl: 'list.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ListComponent {

  @Input() disableRipple: boolean;
}
