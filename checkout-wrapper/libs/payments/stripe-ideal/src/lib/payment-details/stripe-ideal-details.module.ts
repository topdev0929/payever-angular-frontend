import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentDetailsModule } from '@pe/checkout/payment';

import { PaymentDetailsContainerComponent } from '../payment-details';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [
    PaymentDetailsContainerComponent,
  ],
  exports: [
    PaymentDetailsContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class StripeIdealDetailsModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
