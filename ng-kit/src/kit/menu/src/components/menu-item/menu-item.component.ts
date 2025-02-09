import { Component, Input, ViewChild } from '@angular/core';

import { MenuItemInterface } from '../../interfaces';

@Component({
  selector: 'pe-menu-item',
  templateUrl: './menu-item.component.html'
})
export class MenuItemComponent {
  @Input() items: MenuItemInterface[];

  @ViewChild('childMenu', { static: true }) childMenu: any;

  onMenuItemClick(item: MenuItemInterface) {
    if (item.onClick) {
      item.onClick();
    }
  }
}
