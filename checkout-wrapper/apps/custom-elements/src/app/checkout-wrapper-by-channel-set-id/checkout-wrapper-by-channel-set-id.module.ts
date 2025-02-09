import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AuthInterceptor } from '@pe/auth';
import { ApiModule } from '@pe/checkout/api';


import { PeCheckoutWrapperByChannelSetIdComponent } from './checkout-wrapper-by-channel-set-id.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    ApiModule,
  ],
  declarations: [
    PeCheckoutWrapperByChannelSetIdComponent,
  ],
  exports: [
    PeCheckoutWrapperByChannelSetIdComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: AuthInterceptor,
    },
  ],
})
export class CheckoutWrapperByChannelSetIdModule {}
