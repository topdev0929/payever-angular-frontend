import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ApiModule } from '@pe/checkout/api';

import { PeCheckoutWidgetComponent } from './checkout-widget.component';

@NgModule({
  imports: [
    CommonModule,

    ApiModule,
  ],
  declarations: [
    PeCheckoutWidgetComponent,
  ],
  exports: [
    PeCheckoutWidgetComponent,
  ],
})
export class CheckoutWidgetModule {}
