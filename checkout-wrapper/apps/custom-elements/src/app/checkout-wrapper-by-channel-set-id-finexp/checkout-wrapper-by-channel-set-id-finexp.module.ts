import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ApiModule } from '@pe/checkout/api';

import { PeCheckoutWrapperByChannelSetIdFinExpComponent } from './checkout-wrapper-by-channel-set-id-finexp.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    ApiModule,
  ],
  declarations: [
    PeCheckoutWrapperByChannelSetIdFinExpComponent,
  ],
  exports: [
    PeCheckoutWrapperByChannelSetIdFinExpComponent,
  ],
})
export class CheckoutWrapperByChannelSetIdFinExpModule {
}
