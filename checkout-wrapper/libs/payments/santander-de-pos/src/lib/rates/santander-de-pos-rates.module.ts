import { CommonModule } from '@angular/common';
import { Type, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import {
  DocsManagerService,
  IncomeService,
  PaymentService,
  RatesCalculationApiService,
  RatesCalculationService,
  SantanderDePosFlowService,
  docsManagerServiceFactory,
  ratesCalculationServiceFactory,
} from '@pe/checkout/santander-de-pos/shared';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { IncomeModule, RateModule } from '../shared/sections';

import {
  RatesContainerComponent,
  FormComponent,
  SummaryRatesPrimaryComponent,
} from './components';

@NgModule({
  declarations: [
    RatesContainerComponent,
    FormComponent,
    SummaryRatesPrimaryComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    ReactiveFormsModule,
    PaymentTextModule,
    UtilsModule,

    RateModule,
    IncomeModule,
    ContinueButtonModule,
  ],
  exports: [
    RatesContainerComponent,
  ],
  providers: [
    { provide: RatesCalculationService, useFactory: ratesCalculationServiceFactory, deps: [Injector] },
    RatesCalculationApiService,
    SantanderDePosFlowService,
    IncomeService,
    {
      provide: DocsManagerService,
      useFactory: docsManagerServiceFactory,
    },
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
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderDePosRatesModule {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }

  resolvePaymentSummaryStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
