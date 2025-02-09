import { Component, Input } from '@angular/core';
import { MenuItemInterface } from '../../interfaces';

@Component({
  selector: 'pe-menu',
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  @Input() title: string;
  @Input() icon: string;
  @Input() iconSize: number;
  @Input() menuToggleClass: string = '';
  @Input() menuClass: string = '';
  @Input() menuItems: MenuItemInterface[] = [];
}
