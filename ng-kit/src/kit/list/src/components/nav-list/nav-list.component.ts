import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-nav-list',
  templateUrl: 'nav-list.component.html',
  encapsulation: ViewEncapsulation.None
})
export class NavListComponent {

  @Input() disableRipple: boolean;
}
