import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { BasePaymentDetailsModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { PaymentDetailsContainerComponent } from '../payment-details';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [
    PaymentDetailsContainerComponent,
  ],
  exports: [
    PaymentDetailsContainerComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    UtilsModule,
    SharedModule,
  ],
})
export class StripeDirectdebitDetailsModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<PaymentDetailsContainerComponent> {
    return PaymentDetailsContainerComponent;
  }
}
