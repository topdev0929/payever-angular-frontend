import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentFinishModule } from '@pe/checkout/payment';


import { PaymentService } from '../shared';

import { FinishComponent, FinishContainerComponent } from './components';

@NgModule({
  declarations: [
    FinishContainerComponent,
    FinishComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
  ],
  exports: [
    FinishContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SantanderUkFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
