import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { NavbarPageInterface } from '../../entities/navbar';

@Component({
  selector: 'pe-builder-navbar-pages-button',
  templateUrl: './navbar-pages-button.component.html',
  styleUrls: ['./navbar-pages-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarPagesButtonComponent {
  @Input()
  page: NavbarPageInterface;

  @Input()
  active: boolean;

  @Input()
  readOnly: boolean;

  @Output()
  readonly selected = new EventEmitter();

  @Output()
  readonly copied = new EventEmitter();

  @Output()
  readonly deleted = new EventEmitter();

}
