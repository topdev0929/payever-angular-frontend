import { Component, Injector, Input, OnInit } from '@angular/core';
import { filter, take, takeUntil } from 'rxjs/operators';

import { FormScheme } from '@pe/forms';

import { PaymentMethodEnum } from '../../../../../shared';
import { PaymentWithVariantInterface } from '../../../../../shared';
import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    payExCaptureEnabled: boolean
  };
}

@Component({
  selector: 'payment-settings-payExCaptureEnabled',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss']
})
export class PaymentSettingsPayExCaptureEnabledComponent extends BaseSettingsComponent<FormInterface> implements OnInit {

  canChangePayExCaptureEnabled: boolean = false;

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'payExCaptureEnabled',
          type: 'checkbox',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24 form-fieldset-field-no-padding-mobile'
          }
        }
      ]
    }
  };

  private isReady: boolean = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.paymentsStateService.getPaymentsWithVariant().pipe(filter(d => !!d && d.length > 0), take(1), takeUntil(this.destroyed$)).subscribe((payments: PaymentWithVariantInterface[]) => {
      // TODO PAF-11526 This check will be moved to BE. FE should just receive error when value change is not allowed.
      const payExCreditCard: PaymentWithVariantInterface = payments.find(payment => {
        return payment.option.payment_method === PaymentMethodEnum.PAYEX_CREDITCARD;
      });
      if (payExCreditCard) {
        this.canChangePayExCaptureEnabled =
          payExCreditCard.variants[this.paymentIndex] &&
          payExCreditCard.variants[this.paymentIndex].completed &&
          payExCreditCard.variants[this.paymentIndex].status === 'enabled' &&
          payExCreditCard.variants[this.paymentIndex].payment_option_id === payExCreditCard.option.id;
      }
    }, error => {
      console.error('Cant load payments', error);
      this.showStepError(this.translateService.translate('categories.payments.settings.payex_capture_enabled.cant_load_payments'));
    });
  }

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        payExCaptureEnabled: [credentials['payExCaptureEnabled'] || false],
      })
    });
    this.afterCreateFormDeferred();
    this.isReady = true;
  }

  protected onUpdateFormData(formValues: FormInterface): void {
    if (formValues && formValues.credentials && formValues.credentials.payExCaptureEnabled && !this.canChangePayExCaptureEnabled) {
      this.form.get('credentials').get('payExCaptureEnabled').setValue(false);
      if (this.isReady) {
        this.showStepError(this.translateService.translate('categories.payments.settings.payex_capture_enabled.disabled_feature_warning'));
      }
    } else {
      super.onUpdateFormData(formValues);
    }
  }
}
