import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { BasePaymentModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

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
    FormUtilsModule,
    FormsModule,
    UtilsModule,
    SharedModule,
  ],
})
export class SofortModule extends BasePaymentModule {

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
