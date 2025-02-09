import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';

import { FinishContainerComponent } from './finish';
import { RatesViewContainerComponent } from './rates-view';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from './settings';
import { PaymentService, SantanderDeApiService, SantanderDeFlowService, SharedModule } from './shared';

@NgModule({
  declarations: [
    FinishContainerComponent,
    RatesViewContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
    RatesViewContainerComponent,
  ],
  imports: [
    CommonModule,

    SharedModule,
  ],
  providers: [
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
    SantanderDeFlowService,
    SantanderDeApiService,
  ],
})
export class SantanderDeModule extends BasePaymentModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }

  resolvePaymentSummaryStepContainerComponent(): Type<RatesViewContainerComponent> {
    return RatesViewContainerComponent;
  }
}
