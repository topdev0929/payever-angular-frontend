import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';

import { AddressService } from '../../../../../../../kit/address';
import { ErrorBag } from '../../../../../../../kit/form';
import { FormFieldsetDefaultExampleComponent } from '../form-fieldset-default-example/form-fieldset-default-example.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'doc-form-fieldset-hide-disabled-example',
  templateUrl: 'form-fieldset-hide-disabled-example.component.html',
  providers: [ErrorBag]
})
export class FormFieldsetHideDisabledExampleComponent extends FormFieldsetDefaultExampleComponent {

  constructor(
    injectorInstance: Injector,
    protected errorBagInstance: ErrorBag,
    private addressServiceInstance: AddressService
  ) {
    super(injectorInstance, errorBagInstance, addressServiceInstance);
  }

  disableSomeFields(): void {
    this.toggleControl('datepickerValue', false);
    this.toggleControl('autocompleteValue', false);
    this.toggleControl('autocompleteGooglePlacesValue', false);
    this.toggleControl('inputCurrencyValue', false);
    this.toggleControl('radioValue', false);
  }

  enableSomeFields(): void {
    this.toggleControl('datepickerValue', true);
    this.toggleControl('autocompleteValue', true);
    this.toggleControl('autocompleteGooglePlacesValue', true);
    this.toggleControl('inputCurrencyValue', true);
    this.toggleControl('radioValue', true);
  }
}
