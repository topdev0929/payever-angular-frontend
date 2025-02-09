import { Component, Input, Injector, } from '@angular/core';

import { BaseIframeInputComponent } from '../../../iframe-input/components';

@Component({
  selector: 'pe-iframe-input-iban',
  templateUrl: './iframe-input-iban.component.html',
  styleUrls: ['./iframe-input-iban.component.scss']
})
export class IframeInputIbanComponent extends BaseIframeInputComponent {

  constructor(injector: Injector) {
    super(injector);
  }
}
