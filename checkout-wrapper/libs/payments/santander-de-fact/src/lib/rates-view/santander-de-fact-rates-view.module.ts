import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentSummaryModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import {
  RatesCalculationService,
  SantanderFactDeApiService,
  SantanderFactDeFlowService,
  SharedModule,
} from '../shared';

import { RatesInfoTableComponent, RatesViewContainerComponent } from './components';

@NgModule({
  declarations: [
    RatesInfoTableComponent,
    RatesViewContainerComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    SharedModule,
  ],
  providers: [
    RatesCalculationService,
    SantanderFactDeApiService,
    SantanderFactDeFlowService,
  ],
})
export class SantanderFactDeRatesViewModule extends BasePaymentSummaryModule {
  resolvePaymentSummaryStepContainerComponent(): Type<RatesViewContainerComponent> {
    return RatesViewContainerComponent;
  }
}
