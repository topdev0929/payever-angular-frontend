import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { FinishModule as SdkFinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';
import { CheckoutUiPaymentLogoModule } from '@pe/checkout/ui/payment-logo';

import { PaymentService } from '../shared';

import { FinishComponent, FinishContainerComponent, FinishContainerStyleComponent } from './components';



@NgModule({
  declarations: [
    FinishComponent,
    FinishContainerStyleComponent,
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    CheckoutUiPaymentLogoModule,
    SdkFinishModule,
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
export class SwedbankFinishModule extends BasePaymentModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
