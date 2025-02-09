import { NgModule, Type } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer, PAYMENT_SETTINGS } from '@pe/checkout/payment';

import { PaymentService } from '../../shared';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';

import { InquiryContainerComponent } from './_container';

@NgModule({
  imports: [
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class SantanderAtInstantInquiryModule extends BaseChoosePaymentStepContainer {
  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
