import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { FinishContainerComponent } from './finish';
import { InquiryContainerComponent } from './inquiry';
import { PaymentDetailsContainerComponent } from './payment-details';
import { PaymentService, SharedModule } from './shared';

@NgModule({
  declarations: [
    FinishContainerComponent,
    PaymentDetailsContainerComponent,
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    UtilsModule,
    SharedModule,
  ],
  exports: [
    FinishContainerComponent,
    PaymentDetailsContainerComponent,
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class WiretransferModule extends BasePaymentModule {

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
