import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { FinishModule } from '@pe/checkout/finish';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { BaseChoosePaymentModule, BaseChoosePaymentStepContainer } from '@pe/checkout/payment';
import { PluginsModule } from '@pe/checkout/plugins';
import { RatesModule } from '@pe/checkout/rates';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { RatesCalculationService, SharedModule } from '../shared';

import {
  PersonalFormComponent,
  RatesContainerComponent,
  RatesEditListComponent,
  RatesFormComponent,
  TermsFormComponent,
} from './components';

@NgModule({
  declarations: [
    PersonalFormComponent,
    RatesContainerComponent,
    RatesFormComponent,
    RatesEditListComponent,
    TermsFormComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
    FormsModule,
    PluginsModule,
    PaymentTextModule,
    RatesModule,

    ReactiveFormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    SharedModule,
    CheckoutFormsDateModule,
  ],
  providers: [
    RatesCalculationService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderFactDePosRatesModule extends BaseChoosePaymentStepContainer implements BaseChoosePaymentModule {

  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
