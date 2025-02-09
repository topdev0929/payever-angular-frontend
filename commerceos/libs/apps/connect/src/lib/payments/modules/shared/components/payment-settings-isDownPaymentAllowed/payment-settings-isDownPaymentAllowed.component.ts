import { Component } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    isDownPaymentAllowed: boolean
  };
}

@Component({
  selector: 'payment-settings-isDownPaymentAllowed',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsIsDownPaymentAllowedComponent extends BaseSettingsComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'isDownPaymentAllowed',
          type: 'checkbox',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24 form-fieldset-field-no-padding-mobile',
          },
        },
      ],
    },
  };

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        isDownPaymentAllowed: [credentials['isDownPaymentAllowed'] || false],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
