import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { DialogModule } from '@pe/checkout/dialog';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { BaseChoosePaymentStepContainer, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import {
  ProductsCalculationService,
  SantanderDkApiService,
  SantanderDkFlowService,
  SharedModule,
} from '../shared';

import {
  RatesContainerComponent,
  RatesContainerStylesComponent,
  RatesEditListComponent,
  RatesFormComponent,
  TermsFormComponent,
} from './components';

@NgModule({
  declarations: [
    RatesContainerStylesComponent,
    RatesContainerComponent,
    RatesFormComponent,
    RatesEditListComponent,
    TermsFormComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
    RatesModule,
    PaymentTextModule,
    DialogModule,

    MatCheckboxModule,
    CheckoutFormsCoreModule,
    SharedModule,
  ],
  exports: [
    RatesContainerComponent,
  ],
  providers: [
    SantanderDkFlowService,
    SantanderDkApiService,
    ProductsCalculationService,
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
export class SantanderDkRatesModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
