import { Component, ElementRef, Input } from '@angular/core';

import { peVariables } from '../../../../../pe-variables';
import { AddonType } from '../../enums/addon-type.enum';
import { AddonInterface } from '../../interfaces';

@Component({
  selector: 'pe-form-addon',
  styleUrls: ['./addon.component.scss'],
  templateUrl: 'addon.component.html'
})
export class FormAddonComponent {

  @Input() addon: AddonInterface;

  addonTypes: typeof AddonType = AddonType;

  constructor(private elementRef: ElementRef) {}

  get iconClass(): string {
    let size: string = null;
    if ( this.addon.iconSize ) {
      size = `-${this.addon.iconSize}`;
    }
    else {
      size = /-[0-9]+$/.exec(this.addon.iconId)[0];
    }
    return size ? `icon icon${size}` : '';
  }

  get iconId(): string {
    return `#${this.addon.iconId}`;
  }

  get loaderSize(): number {
    return parseFloat(peVariables['spinnerStrokeXxs'] as string);
  }

  get loaderStrokeWidth(): number {
    return parseFloat(peVariables['spinnerStrokeWidth'] as string);
  }

  get widthPx(): number {
    return this.elementRef && this.elementRef.nativeElement ? this.elementRef.nativeElement.offsetWidth : 0;
  }

  onClickAddon(event?: Event): void {
    if (this.addon.onClick) {
      this.addon.onClick(event);
    }
    if (event) {
      event.preventDefault();
    }
  }
}
