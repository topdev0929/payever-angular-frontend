import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentOptionComponent } from './payment-option.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PaymentOptionComponent
  ],
  entryComponents: [ PaymentOptionComponent ],
  exports: [ PaymentOptionComponent ]
})
export class PaymentOptionModule {}
