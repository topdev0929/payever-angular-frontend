import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';

import {
  FinishComponent,
} from './components';
import { PaymentService, StripeApiService } from './services';

@NgModule({
  declarations: [
    FinishComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
  ],
  exports: [
    FinishComponent,
  ],
  providers: [
    StripeApiService,
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SharedModule {
}
