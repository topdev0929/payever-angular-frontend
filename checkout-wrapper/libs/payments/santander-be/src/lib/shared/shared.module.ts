import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule as SdkFinishModule } from '@pe/checkout/finish';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { StorageModule as SdkStorageModule } from '@pe/checkout/storage';


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
    SdkFinishModule,
    SdkStorageModule,
  ],
  exports: [
    SdkStorageModule,
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
