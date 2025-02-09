import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentDetailsModule } from '@pe/checkout/payment';

import { PaymentDetailsContainerComponent } from '../payment-details';
import { PaymentService } from '../shared';

@NgModule({
  declarations: [
    PaymentDetailsContainerComponent,
  ],
  exports: [
    PaymentDetailsContainerComponent,
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class HsbcDetailsModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
