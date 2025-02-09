import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentDetailsModule } from '@pe/checkout/payment';

import { ZiniaPaymentService } from '../services';

import { PaymentDetailsContainerComponent } from './payment-details-container.component';

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
      useClass: ZiniaPaymentService,
    },
  ],
})
export class ZiniaBNPLPaymentDetailsModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
