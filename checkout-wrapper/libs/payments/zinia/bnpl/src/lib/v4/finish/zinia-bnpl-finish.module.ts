import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';
import { OtpContainerComponent } from '@pe/checkout/zinia/shared';

import {
  ZiniaBnplApiService,
  ZiniaBnplFlowService,
  ZiniaBnplUtilsService,
  ZiniaPaymentService,
} from '../services';

import { FinishComponent } from './finish';
import { FinishContainerComponent } from './finish-container.component';

@NgModule({
  declarations: [
    FinishContainerComponent,
    FinishComponent,
  ],
  exports: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
    OtpContainerComponent,
  ],
  providers: [
    ZiniaBnplApiService,
    ZiniaBnplFlowService,
    ZiniaBnplUtilsService,
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: ZiniaPaymentService,
    },
  ],
})
export class ZiniaBNPLFinishModuleV4 extends BasePaymentModule {

  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
