import { Component, Input, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { SidenavPosition } from '../../enums';

@Component({
  selector: 'pe-sidenav',
  templateUrl: 'sidenav.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SidenavComponent {

  @Input() classNames: string;
  @Input() fixedBottomGap: number;
  @Input() fixedInViewport: boolean = false;
  @Input() fixedTopGap: number;
  @Input() hasBackdrop: boolean = false;
  @Input() opened: boolean = false;
  @Input() position: SidenavPosition = SidenavPosition.Start;

  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;

}
