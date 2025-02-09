//Zinia BNPL
import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer, PaymentErrorComponent } from '@pe/checkout/payment';

import { PaymentService } from '../services';

import {
  DetailsFormComponent,
  InquiryContainerComponent,
  InquiryFormComponent,
  TermsFormComponent,
} from './components';

@NgModule({
  declarations: [
    InquiryFormComponent,
    InquiryContainerComponent,
    DetailsFormComponent,
    TermsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    CheckoutFormsInputModule,

    PaymentErrorComponent,
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
export class ZiniaBNPLInquiryModuleV3 extends BaseChoosePaymentStepContainer {

  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
