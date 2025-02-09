import { Component, Input } from '@angular/core';

import { LayoutService } from '../services';

@Component({
  selector: 'pe-layout-content',
  styleUrls: ['layout-content.component.scss'],
  templateUrl: 'layout-content.component.html'
})
export class LayoutContentComponent {

  @Input() noPadding: boolean;
  @Input() contentLightGrey: boolean;
  @Input() noScroll: boolean;
  @Input() bodyTransparent: boolean = true;
  @Input() sidebarTransparent: boolean = true;
  @Input() collapsed: boolean = false;
  @Input() showSidebar: boolean = false;
  @Input() showCaution: boolean = false;

  constructor(
    public layoutService: LayoutService
  ) {}

}
