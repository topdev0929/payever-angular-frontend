import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { parseTestAttribute } from '../../../core/utils';
import { NavbarMenuItemInterface } from '../../entities/navbar';

@Component({
  selector: 'pe-builder-navbar-button-menu',
  templateUrl: './navbar-button-menu.component.html',
  styleUrls: ['./navbar-button-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarButtonMenuComponent {
  @Input()
  data: NavbarMenuItemInterface[];

  @Output()
  readonly changed = new EventEmitter<NavbarMenuItemInterface>();

  getTestingAttribute(val: string): string {
    return parseTestAttribute(val);
  }
}
