import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { UiModule } from '@pe/checkout/ui';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { DEFAULT_POLLING_CONFIG, POLLING_CONFIG } from '@pe/checkout/utils/poll';

import {
  FinishComponent,
} from './common/components';
import {
  ContractApiService,
  RatesCalculationService,
  RatesCalculationApiService,
  SantanderSeApiService,
  SantanderSeFlowService,
} from './common/services';
import { PaymentService } from './services';

@NgModule({
  declarations: [
    FinishComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
    UiModule,
    PaymentTextModule,
  ],
  exports: [
    FinishModule,
    UiModule,
    PaymentTextModule,
    FinishComponent,
  ],
  providers: [
    {
      provide: POLLING_CONFIG,
      useValue: DEFAULT_POLLING_CONFIG,
    },
    ContractApiService,
    RatesCalculationService,
    RatesCalculationApiService,
    SantanderSeFlowService,
    SantanderSeApiService,
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SharedModule {
}
