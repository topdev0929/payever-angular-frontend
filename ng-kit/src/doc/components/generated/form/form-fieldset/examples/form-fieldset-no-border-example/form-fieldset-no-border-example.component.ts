import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';

import { AddressService } from '../../../../../../../kit/address';
import { ErrorBag } from '../../../../../../../kit/form';
import { FormFieldsetDefaultExampleComponent } from '../form-fieldset-default-example/form-fieldset-default-example.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'doc-form-fieldset-no-border-example',
  templateUrl: 'form-fieldset-no-border-example.component.html',
  providers: [ErrorBag]
})
export class FormFieldsetNoBorderExampleComponent extends FormFieldsetDefaultExampleComponent {

  constructor(
    injectorInstance: Injector,
    protected errorBagInstance: ErrorBag,
    addressServiceInstance: AddressService,
  ) {
    super(injectorInstance, errorBagInstance, addressServiceInstance);
  }

}
