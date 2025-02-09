import { Component, Injector, OnInit } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  options: {
    storeId: string
  };
}

@Component({
  selector: 'payment-readonly-storeId',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss']
})
export class PaymentReadonlyStoreIdComponent extends BaseSettingsComponent<FormInterface> implements OnInit {

  fieldsetsKey: string = 'options';

  formScheme: FormScheme = {
    fieldsets: {
      options: [
        {
          name: 'storeId',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            readonly: true
          }
        }
      ]
    }
  };

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      options: this.formBuilder.group({
        storeId: [
          credentials['storeId']
        ]
      })
    });
    this.afterCreateFormDeferred();
  }
}
