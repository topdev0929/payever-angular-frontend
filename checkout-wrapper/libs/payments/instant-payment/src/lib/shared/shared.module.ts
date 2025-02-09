import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';
import { CheckoutUiPaymentLogoModule } from '@pe/checkout/ui/payment-logo';
import { UtilsModule } from '@pe/checkout/utils';

import { FinishComponent } from './components';
import { InstantPaymentService } from './services';

@NgModule({
  imports: [
    CommonModule,
    UtilsModule,
    FinishModule,

    CheckoutUiPaymentLogoModule,
  ],
  exports: [
    FinishComponent,
  ],
  declarations: [
    FinishComponent,
  ],
  providers: [
    InstantPaymentService,
  ],
})
export class SharedModule {
}
