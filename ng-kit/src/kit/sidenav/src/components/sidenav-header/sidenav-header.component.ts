import { Component, Input, ViewEncapsulation } from '@angular/core';
import { HeaderButtonInterface } from '../../interfaces';

@Component({
  selector: 'pe-sidenav-header',
  templateUrl: 'sidenav-header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SidenavHeaderComponent {
  @Input() leftButtonConfig: HeaderButtonInterface;
  @Input() rightButtonConfig: HeaderButtonInterface;
  @Input() classNames: HeaderButtonInterface;
}
