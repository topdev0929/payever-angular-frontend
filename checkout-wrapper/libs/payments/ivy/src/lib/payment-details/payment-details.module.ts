import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import {
  ABSTRACT_PAYMENT_SERVICE,
  AbstractPaymentDetailsContainerInterface,
  BasePaymentDetailsModuleInterface,
} from '@pe/checkout/payment';

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
export class IvyPaymentDetailsModule implements BasePaymentDetailsModuleInterface {
  resolvePaymentDetailsStepContainerComponent(): Type<AbstractPaymentDetailsContainerInterface> {
    return PaymentDetailsContainerComponent;
  }
}
