import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PaymentLogoComponent } from './payment-logo.component';


@NgModule({
  declarations: [
    PaymentLogoComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    PaymentLogoComponent,
  ],
})
export class CheckoutUiPaymentLogoModule {}
