import { Component } from '@angular/core';
import { MenuItemInterface } from '../../../../../../kit/menu/src/interfaces';

@Component({
  selector: 'doc-menu-example-default',
  templateUrl: './menu-example-default.component.html'
})
export class MenuExampleDefaultComponent {
  menuItems: MenuItemInterface[] = [
    {
      title: 'subMenu1',
      children: [{
        title: 'Menu item 1',
        onClick: () => alert('Menu item 1')
      }, {
        title: 'Menu item 2',
        onClick: () => alert('Menu item 2')
      }]
    },
    {
      title: 'subMenu2',
      children: [{
        title: 'Menu item 3',
        onClick: () => alert('Menu item 3')
      }, {
        title: 'Menu item 4',
        onClick: () => alert('Menu item 4')
      }]
    },
    {
      title: 'Menu item 5',
      onClick: () => alert('Menu item 5')
    }
  ]
}
