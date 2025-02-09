import {
  Component, ElementRef, Input, Optional, Self,  Injector
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

import { BaseMaterialIframeInputComponent } from '../base-material-iframe-input.component';

@Component({
  selector: 'material-iframe-input',
  templateUrl: 'material-iframe-input.component.html',
  styleUrls: ['material-iframe-input.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: MaterialIframeInputComponent}],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.aria-describedby]': 'describedBy',
  }
})
export class MaterialIframeInputComponent extends BaseMaterialIframeInputComponent {

  @Input() minLength: number = null;
  @Input() maxLength: number = null;
  @Input() numberMin: number = null;
  @Input() numberMax: number = null;
  @Input() numberIsInteger: boolean = false;
  @Input() showNumberControls: boolean = false;

  constructor(
    injector: Injector,
    elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() ngControl: NgControl) {
    super(injector, elementRef, ngControl);
  }

  getIframeBaseSrc(): string {
    return `${this.configService.getCustomConfig().cdn}/fields/input.html`;
  }

  getConfig(): any {
    return {
      type: this.type,
      minLength: this.minLength,
      maxLength: this.maxLength,
      numberMin: this.numberMin,
      numberMax: this.numberMax,
      numberIsInteger: this.numberIsInteger,
      showNumberControls: this.showNumberControls,
      defaultValue: this.value
    };
  }
}
