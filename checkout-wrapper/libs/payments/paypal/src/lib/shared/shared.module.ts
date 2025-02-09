import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';

import {
  FormComponent,
  FinishComponent,
} from './components';
import { PaymentService } from './services';

@NgModule({
  declarations: [
    FormComponent,
    FinishComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
  ],
  exports: [
    FormComponent,
    FinishComponent,
  ],
  providers: [
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SharedModule {
}
