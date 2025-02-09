import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentFinishModule } from '@pe/checkout/payment';

import { PaymentService } from '../shared';

import { FinishComponent, FinishContainerComponent, FinishStylesComponent } from './components';

@NgModule({
  declarations: [
    FinishComponent,
    FinishStylesComponent,
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SantanderDeInvoiceFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
