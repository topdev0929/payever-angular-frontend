import { Component, Input } from '@angular/core';

import { AddonType } from '../../enums/addon-type.enum';
import { AddonInterface } from '../../interfaces';

@Component({
  selector: 'pe-form-addon-inline-prepend',
  styleUrls: ['./addon-inline-prepend.component.scss'],
  templateUrl: 'addon-inline-prepend.component.html'
})
export class FormAddonInlinePrependComponent {

  @Input() addon: AddonInterface;

  addonTypes: typeof AddonType = AddonType;

  onClickAddon(event?: Event): void {
    if (this.addon.onClick) {
      this.addon.onClick(event);
    }
    if (event) {
      event.preventDefault();
    }
  }
}
