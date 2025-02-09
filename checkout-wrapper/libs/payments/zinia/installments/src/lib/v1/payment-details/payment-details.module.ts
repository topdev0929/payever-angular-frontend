import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentDetailsModule } from '@pe/checkout/payment';

import { PaymentService } from '../shared';

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
      useClass: PaymentService,
    },
  ],
})
export class ZiniaInstallmentsV1PaymentDetailsModule extends BasePaymentDetailsModule {
  public resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
