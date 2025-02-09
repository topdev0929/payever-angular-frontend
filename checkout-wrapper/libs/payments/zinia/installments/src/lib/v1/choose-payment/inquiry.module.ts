//Zinia BNPL
import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer } from '@pe/checkout/payment';

import { PaymentService } from '../shared';

import { InquiryContainerComponent } from './components';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class ZiniaInstallmentsV1ChoosePaymentModule extends BaseChoosePaymentStepContainer {

  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
