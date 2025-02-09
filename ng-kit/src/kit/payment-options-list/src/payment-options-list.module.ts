import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentOptionsListComponent } from './payment-options-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PaymentOptionsListComponent
  ],
  entryComponents: [ PaymentOptionsListComponent ],
  exports: [ PaymentOptionsListComponent ]
})
export class PaymentOptionsListModule {}
