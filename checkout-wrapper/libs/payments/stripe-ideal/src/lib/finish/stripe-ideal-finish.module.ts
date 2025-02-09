import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { BasePaymentFinishModule } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';

import { SharedModule, StripeCommonService, StripeFlowService } from '../shared';

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
    UtilsModule,
    SharedModule,
  ],
  providers: [
    StripeFlowService,
    StripeCommonService,
  ],
})
export class StripeIdealFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
