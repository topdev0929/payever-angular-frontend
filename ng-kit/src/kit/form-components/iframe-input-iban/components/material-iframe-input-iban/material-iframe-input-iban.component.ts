import {
  Component, ElementRef, Input, Optional, Self,  Injector
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

import { BaseMaterialIframeInputComponent } from '../../../iframe-input/components';

@Component({
  selector: 'material-iframe-input-iban',
  templateUrl: 'material-iframe-input-iban.component.html',
  styleUrls: ['material-iframe-input-iban.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: MaterialIframeInputIbanComponent}],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.aria-describedby]': 'describedBy',
  }
})
export class MaterialIframeInputIbanComponent extends BaseMaterialIframeInputComponent {

  constructor(
    injector: Injector,
    elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() ngControl: NgControl) {
    super(injector, elementRef, ngControl);
  }

  getIframeBaseSrc(): string {
    return `${this.configService.getCustomConfig().cdn}/fields/input-iban.html`;
  }

  getConfig(): any {
    return {
      type: this.type,
      defaultValue: this.value
    };
  }
}
