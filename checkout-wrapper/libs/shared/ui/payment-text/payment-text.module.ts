import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PaymentTextComponent } from './payment-text.component';
import { PaymentTextStylesComponent } from './payment-text.component-styles';

@NgModule({
  declarations: [
    PaymentTextComponent,
    PaymentTextStylesComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    PaymentTextComponent,
  ],
})
export class PaymentTextModule {}
