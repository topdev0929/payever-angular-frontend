import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { BaseChoosePaymentStepContainer, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import {
  RatesCalculationApiService,
  RatesCalculationService,
  SantanderNoApiService,
  SantanderNoFlowService,
  SharedModule,
} from '../shared';

import {
  RatesContainerComponent,
  RatesEditListComponent,
  RatesFormComponent,
  UISelectedRateDetailsComponent,
} from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RatesModule,
    PaymentTextModule,
    SharedModule,

    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
  ],
  declarations: [
    RatesContainerComponent,
    RatesEditListComponent,
    RatesFormComponent,
    UISelectedRateDetailsComponent,
  ],
  exports: [
    RatesContainerComponent,
  ],
  providers: [
    SantanderNoFlowService,
    SantanderNoApiService,
    RatesCalculationService,
    RatesCalculationApiService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderNoRatesModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
