import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';

import { SharedModule } from '../shared';

import { InquiryContainerComponent, InquiryFormComponent } from './components';

@NgModule({
  declarations: [
    InquiryContainerComponent,
    InquiryFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    SharedModule,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class StripeInquiryModule {
  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
