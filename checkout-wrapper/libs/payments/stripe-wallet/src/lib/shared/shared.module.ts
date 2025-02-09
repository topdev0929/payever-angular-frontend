import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FinishModule as SdkFinishModule } from '@pe/checkout/finish';
import { FormUtilsModule as SdkFormUtilsModule } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { UtilsModule } from '@pe/checkout/utils';


import {
  FinishComponent,
} from './components';
import { PaymentService } from './services';

@NgModule({
  declarations: [
    FinishComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
    SdkFormUtilsModule,
    SdkFinishModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    SdkFormUtilsModule,

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
