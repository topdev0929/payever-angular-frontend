import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { UiModule } from '@pe/checkout/ui';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';

import { BasePaymentSummaryModule } from '../../../../../shared/payment/base-payment-summary.module';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import {
  RatesCalculationApiService,
  RatesCalculationService,
  SantanderNoApiService,
  SantanderNoFlowService,
  SharedModule,
} from '../shared';

import { RatesInfoTableComponent, RatesViewContainerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    RatesModule,
    PaymentTextModule,
    UiModule,
    MatButtonToggleModule,
    UtilsModule,
    SharedModule,
  ],
  declarations: [
    RatesInfoTableComponent,
    RatesViewContainerComponent,
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
  ],
})
export class SantanderNoRatesViewModule extends BasePaymentSummaryModule {
  resolvePaymentSummaryStepContainerComponent(): Type<RatesViewContainerComponent> {
    return RatesViewContainerComponent;
  }
}
