import { Component, Input, Injector, ViewChild, ElementRef, Directive } from '@angular/core';

import { AbstractFieldComponent } from '../../../form-core/components/abstract-field';
import { InputType } from '../../../form-core';
import { AbstractInputComponent } from '../../input/components/abstract-input/abstract-input.component';

@Directive()
export class BaseIframeInputComponent extends AbstractInputComponent {

  @Input() type: InputType = InputType.Text;
  @Input() formToken: string = null;
  @Input() paymentFlowId: string = null;

  @ViewChild('iframe', { static: true }) iframe: ElementRef;

  constructor(injector: Injector) {
    super(injector);
  }

  get formKey(): string {
    // return AbstractFieldComponent.getFullControlName(this.formControl);
    const name = AbstractFieldComponent.getFullControlName(this.formControl);
    const parts = name.split('.');
    if (parts.length > 1 && parts[0].indexOf('form') === 0) {
      // Small hack to remove root form group: formCustomerDetails.customer.personalBirthName -> customer.personalBirthName
      parts.shift();
    }
    return parts.join('.');
  }
}
