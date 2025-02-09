import { NgModule } from '@angular/core';
import { PaymentOptionDocComponent } from './payment-option-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { PaymentOptionModule } from '../../../../kit/payment-option/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    PaymentOptionModule
  ],
  declarations: [PaymentOptionDocComponent]
})
export class PaymentOptionDocModule {
}
