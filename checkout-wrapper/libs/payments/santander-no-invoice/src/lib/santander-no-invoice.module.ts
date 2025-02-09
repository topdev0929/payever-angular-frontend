import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';

import { FinishContainerComponent } from './finish';
import { PaymentDetailsContainerComponent } from './payment-details';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from './settings';
import { SharedModule } from './shared';

@NgModule({
  declarations: [
    FinishContainerComponent,
    PaymentDetailsContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
    PaymentDetailsContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  providers: [
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class SantanderNoInvoiceModule extends BasePaymentModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }

  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
