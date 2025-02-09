import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer } from '@pe/checkout/payment';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';


import { PaymentService } from '../shared';

import {
  FormComponent,
  PersonalFormComponent,
  RatesContainerComponent,
  TermsFormComponent,
} from './components';

@NgModule({
  declarations: [
    RatesContainerComponent,
    PersonalFormComponent,
    TermsFormComponent,
    FormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaymentTextModule,

    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    CheckoutFormsInputModule,
  ],
  exports: [
    RatesContainerComponent,
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
export class RatesModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
