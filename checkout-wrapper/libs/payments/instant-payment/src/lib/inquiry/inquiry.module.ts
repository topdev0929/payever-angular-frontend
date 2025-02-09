import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import {
  BaseChoosePaymentModule,
  AbstractChoosePaymentContainerInterface,
  ABSTRACT_PAYMENT_SERVICE,
} from '@pe/checkout/payment';

import { PaymentService } from '../shared';

import { InquiryContainerComponent } from './components';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,

    CheckoutFormsCoreModule,
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
export class InstantPaymentInquiryModule implements BaseChoosePaymentModule {
  resolveChoosePaymentStepContainerComponent(): Type<AbstractChoosePaymentContainerInterface> {
    return InquiryContainerComponent;
  }
}
