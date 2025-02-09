import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';

import {
  FinishComponent,
  OpenbankApiService,
  OpenbankFlowService,
  OpenbankUtilsService,
  ZiniaPaymentService,
} from '../shared';


import { FinishContainerComponent } from './finish-container.component';

@NgModule({
  declarations: [
    FinishContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    FinishComponent,
  ],
  providers: [
    OpenbankApiService,
    OpenbankFlowService,
    OpenbankUtilsService,
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: ZiniaPaymentService,
    },
  ],
})
export class ZiniaInstallmentsV2FinishModule extends BasePaymentModule {

  public override resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
