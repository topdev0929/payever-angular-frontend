import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CheckoutModalComponent } from './components/checkout-modal.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CheckoutModalComponent,
  ],
  exports: [
    CheckoutModalComponent,
  ],
})
export class CheckoutModalModule {}
