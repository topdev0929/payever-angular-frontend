import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentSummaryModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { PluginsModule } from '@pe/checkout/plugins';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { SharedModule } from '../shared';

import { RatesInfoTableComponent, RatesViewContainerComponent } from './components';

@NgModule({
  declarations: [
    RatesInfoTableComponent,
    RatesViewContainerComponent,
  ],
  imports: [
    CommonModule,
    PluginsModule,
    UtilsModule,
    SharedModule,
  ],
  providers: [
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class SantanderSeSummaryModule extends BasePaymentSummaryModule {
  resolvePaymentSummaryStepContainerComponent(): Type<RatesViewContainerComponent> {
    return RatesViewContainerComponent;
  }
}
