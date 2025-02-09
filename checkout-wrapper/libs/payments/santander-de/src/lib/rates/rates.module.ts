import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { PaymentService, RatesCalculationService, SantanderDeApiService, SantanderDeFlowService } from '../shared';

import {
  FormComponent,
  RatesContainerComponent,
  RatesEditListComponent,
  RatesFormComponent,
  TermsFormComponent,
} from './components';

@NgModule({
  declarations: [
    RatesContainerComponent,
    FormComponent,
    RatesFormComponent,
    RatesEditListComponent,
    TermsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    UtilsModule,
    RatesModule,
    PaymentTextModule,
  ],
  exports: [RatesContainerComponent],
  providers: [
    RatesCalculationService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
    SantanderDeFlowService,
    SantanderDeApiService,
  ],
})
export class SantanderDeRatesModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
