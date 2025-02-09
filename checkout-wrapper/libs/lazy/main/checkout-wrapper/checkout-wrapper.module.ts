import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LayoutModule } from '../layout';

import { CheckoutWrapperComponent } from './checkout-wrapper.component';

@NgModule({
  declarations: [CheckoutWrapperComponent],
  imports: [
    CommonModule,
    LayoutModule,
  ],
  exports: [CheckoutWrapperComponent],
})
export class CheckoutWrapperModule {}
