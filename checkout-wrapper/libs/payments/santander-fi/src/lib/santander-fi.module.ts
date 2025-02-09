import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';

import { EmbeddedContainerComponent } from './embedded';
import { FinishContainerComponent } from './finish';
import { InquiryContainerComponent } from './inquiry';
import { PaymentDetailsContainerComponent } from './payment-details';
import { PaymentService, SharedModule } from './shared';

@NgModule({
  declarations: [
    EmbeddedContainerComponent,
    FinishContainerComponent,
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    EmbeddedContainerComponent,
    FinishContainerComponent,
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SantanderFiModule extends BasePaymentModule {

  resolveEmbeddedContainerComponent(): Type<EmbeddedContainerComponent> {
    return EmbeddedContainerComponent;
  }

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
