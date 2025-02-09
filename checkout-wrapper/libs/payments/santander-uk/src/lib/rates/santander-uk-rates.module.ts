import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { DialogModule } from '@pe/checkout/dialog';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';


import { PaymentService } from '../shared';

import {
  FormComponent,
  RatesContainerComponent,
  RateDetailsDialogComponent,
  RatesEditListComponent,
} from './components';
import { RatesCalculationApiService, RatesCalculationService } from './services';

@NgModule({
  declarations: [
    RatesContainerComponent,
    FormComponent,
    RatesEditListComponent,
    RateDetailsDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    UtilsModule,
    DialogModule,
    PaymentTextModule,
    RatesModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
  ],
  exports: [
    RatesContainerComponent,
  ],
  providers: [
    RatesCalculationService,
    RatesCalculationApiService,
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
export class SantanderUkRatesModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
