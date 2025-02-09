import { NgModule, Type } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentFinishModule } from '@pe/checkout/payment';

import { PaymentService } from '../../shared';

import { FinishContainerComponent } from './finish-container.component';

@NgModule({
  imports: [
    FinishContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class FinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
