import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { FinishModule as SdkFinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentFinishModule } from '@pe/checkout/payment';

import { BfsApiService, BfsFlowService, PaymentService } from '../shared';

import { FinishContainerComponent } from './components/finish-container/finish-container.component';
import { FinishComponent } from './components/finish/finish.component';


@NgModule({
  declarations: [
    FinishComponent,
    FinishContainerComponent,
  ],
  exports: [
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    SdkFinishModule,
  ],
  providers: [
    BfsFlowService,
    BfsApiService,
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class BfsFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
