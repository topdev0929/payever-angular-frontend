import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentModule } from '@pe/checkout/payment';

import { PaymentService } from '../services';

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
    FormsModule,
    FinishModule,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class ZiniaBNPLFinishModule extends BasePaymentModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
