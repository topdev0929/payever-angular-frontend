import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { PaymentService } from '../shared';

import {
  DetailsFormComponent,
  InquiryContainerComponent,
  InquiryFormComponent,
} from './components';

@NgModule({
  declarations: [
    DetailsFormComponent,
    InquiryFormComponent,
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    ReactiveFormsModule,
    UtilsModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SwedbankInquiryModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
