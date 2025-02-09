import { NgModule } from '@angular/core';
import { PaymentOptionsListDocComponent } from './payment-options-list-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { PaymentOptionsListModule } from '../../../../kit/payment-options-list/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    PaymentOptionsListModule
  ],
  declarations: [PaymentOptionsListDocComponent]
})
export class PaymentOptionsListDocModule {
}
