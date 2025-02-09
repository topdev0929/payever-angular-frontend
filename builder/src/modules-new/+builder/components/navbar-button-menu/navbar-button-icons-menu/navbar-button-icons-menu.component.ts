import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { NavbarSelectInterface } from '../../../entities/navbar';

// TODO: Should be merged with NavbarButtonMenuComponent
@Component({
  selector: 'pe-builder-navbar-button-icons-menu',
  templateUrl: './navbar-button-icons-menu.component.html',
  styleUrls: ['./navbar-button-icons-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarButtonIconsMenuComponent {
  @Input()
  items: NavbarSelectInterface[];

  @Output()
  readonly changed = new EventEmitter<NavbarSelectInterface>();
}
