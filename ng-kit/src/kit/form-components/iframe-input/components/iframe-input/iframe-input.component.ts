import { Component, Input, Injector, } from '@angular/core';

import { BaseIframeInputComponent } from '../base-iframe-input.component';

@Component({
  selector: 'pe-iframe-input',
  templateUrl: './iframe-input.component.html',
  styleUrls: ['./iframe-input.component.scss']
})
export class IframeInputComponent extends BaseIframeInputComponent {

  @Input() minLength: number = null;
  @Input() maxLength: number = null;
  @Input() numberMin: number = null;
  @Input() numberMax: number = null;
  @Input() numberIsInteger: boolean = false;
  @Input() showNumberControls: boolean = false;
  @Input() debounceTime: number = 0; // Not used for now

  constructor(injector: Injector) {
    super(injector);
  }
}
