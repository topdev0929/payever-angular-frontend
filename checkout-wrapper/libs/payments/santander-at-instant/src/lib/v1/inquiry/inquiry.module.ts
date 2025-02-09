import { NgModule, Type } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer } from '@pe/checkout/payment';

import { PaymentService } from '../../shared';

import { InquiryContainerComponent } from './inquiry.component';

@NgModule({
  imports: [
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SantanderAtInstantInquiryModule extends BaseChoosePaymentStepContainer {
  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
