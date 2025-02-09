import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ApiQrService } from './api.qr.service';
import { QrBoxComponent } from './qr-box.component';



@NgModule({
  declarations: [
    QrBoxComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    QrBoxComponent,
  ],
  providers: [
    ApiQrService,
  ],

})
export class CheckoutUiQrBoxModule { }
