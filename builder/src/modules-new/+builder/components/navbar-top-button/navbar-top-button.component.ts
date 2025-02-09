import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

// tslint:disable-next-line:import-blacklist
import { peVariables } from '@pe/ng-kit/src/kit/pe-variables';
import { parseTestAttribute } from '../../../core/utils';

@Component({
  selector: 'pe-builder-navbar-top-button',
  templateUrl: './navbar-top-button.component.html',
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '[class.active]': 'active',
  },
  styleUrls: ['./navbar-top-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarTopButtonComponent {
  @Input()
  label: string;

  @Input()
  editor: any;

  @Input()
  bottomLabel: string;

  @Input()
  disabled: boolean;

  @Input()
  icon: string;

  @Input()
  iconWidth: number;

  @Input()
  iconHeight: number;

  @Input()
  img: string;

  @Input()
  hasDropdownMenu: boolean;

  @Input()
  showDropdownArrow: boolean;

  @Input()
  text: string;

  @Input()
  showSpinner: boolean;

  @Input()
  active: boolean;

  @Output()
  readonly clicked = new EventEmitter();

  spinnerStrokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');
  spinnerDiameter: number = peVariables.toNumber('spinnerStrokeXxs');

  getTestingAttribute(val?: string): string {
    const attr = val || this.bottomLabel || this.label || this.icon;

    return parseTestAttribute(attr);
  }
}
