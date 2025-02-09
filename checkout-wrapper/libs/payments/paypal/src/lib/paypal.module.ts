import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentModule } from '@pe/checkout/payment';

import { FinishContainerComponent } from './finish';
import { InquiryContainerComponent } from './inquiry';
import { PaymentDetailsContainerComponent } from './payment-details';
import { SharedModule } from './shared';

@NgModule({
  declarations: [
    FinishContainerComponent,
    InquiryContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class PaypalModule extends BasePaymentModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }

  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }

  resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
