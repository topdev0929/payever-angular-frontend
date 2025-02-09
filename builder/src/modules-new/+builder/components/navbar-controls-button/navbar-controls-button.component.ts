import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { parseTestAttribute } from '../../../core/utils';

@Component({
  selector: 'pe-builder-navbar-controls-button',
  templateUrl: './navbar-controls-button.component.html',
  styleUrls: ['./navbar-controls-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarControlsButtonComponent {
  @Input()
  label: string;

  @Input()
  disabled: boolean;

  @Input()
  icon: string;

  @Output()
  readonly buttonClick = new EventEmitter();

  @Input()
  hasDropdownMenu: boolean;

  getTestingAttribute(val: string): string {
    return parseTestAttribute(val);
  }
}
