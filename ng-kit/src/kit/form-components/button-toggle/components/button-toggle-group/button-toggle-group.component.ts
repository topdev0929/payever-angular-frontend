import { Component, Input, Injector, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { ButtonToggleAlignment } from '../../enums';
import { ButtonToggleInterface, ButtonToggleChangeEvent } from '../../interfaces';

@Component({
  selector: 'pe-button-toggle-group',
  templateUrl: 'button-toggle-group.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ButtonToggleGroupComponent extends AbstractFieldComponent {

  @Input() alignment: ButtonToggleAlignment = ButtonToggleAlignment.Left;
  @Input() buttons: ButtonToggleInterface[];
  @Input() label: string;
  @Input() multiple: boolean = false;

  @Output() valueChange: EventEmitter<ButtonToggleChangeEvent> = new EventEmitter<ButtonToggleChangeEvent>();

  alignments: typeof ButtonToggleAlignment = ButtonToggleAlignment;

  private readonly iconSizeRE: RegExp = /-[0-9]+$/;

  constructor(protected injector: Injector) {
    super(injector);
  }

  getIconClass(icon: string, iconSize: number): string {
    let size: string;

    if (iconSize) {
      size = `-${iconSize}`;
    } else if (icon && icon.match(this.iconSizeRE)) {
      size = this.iconSizeRE.exec(icon)[0];
    }

    return size ? `icon icon${size}` : '';
  }

  getIconId(icon: string): string {
    return icon ? `#${icon}` : null;
  }

  onChanged(event: MatButtonToggleChange): void {
    this.valueChange.emit({ value: event.value });
  }
}
