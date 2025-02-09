import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BasePaymentSummaryModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { FormConfigService, SharedModule } from '../shared';

import { RatesInfoTableComponent, RatesViewContainerComponent } from './components';

@NgModule({
  declarations: [
    RatesInfoTableComponent,
    RatesViewContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    UtilsModule,
    SharedModule,
  ],
  providers: [
    FormConfigService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class SantanderDkRatesViewModule extends BasePaymentSummaryModule {
  resolvePaymentSummaryStepContainerComponent(): Type<RatesViewContainerComponent> {
    return RatesViewContainerComponent;
  }
}
