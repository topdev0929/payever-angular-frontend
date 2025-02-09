import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ApiModule } from '@pe/checkout/api';

import { PeCheckoutWrapperEditTransactionComponent } from './checkout-wrapper-edit-transaction.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,

    ApiModule,
  ],
  declarations: [
    PeCheckoutWrapperEditTransactionComponent,
  ],
  exports: [
    PeCheckoutWrapperEditTransactionComponent,
  ],
})
export class CheckoutWrapperEditTransactionModule {
}
