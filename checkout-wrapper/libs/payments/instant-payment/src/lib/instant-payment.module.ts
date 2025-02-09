import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { FinishContainerComponent, FinishContainerStyleComponent } from './finish';
import { PaymentDetailsContainerComponent } from './payment-details';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from './settings';
import { PaymentService, SharedModule } from './shared';

@NgModule({
  declarations: [
    FinishContainerComponent,
    FinishContainerStyleComponent,
    PaymentDetailsContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
    PaymentDetailsContainerComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    SharedModule,
  ],
  providers: [

    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
        addressSettings: BILLING_ADDRESS_SETTINGS,
      },
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class InstantPaymentModule extends BasePaymentModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }

  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
