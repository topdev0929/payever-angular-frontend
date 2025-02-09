import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';
import { PaymentVariantService } from '@pe/checkout/payment';

import { MainPaymentComponent } from './payment.component';

@NgModule({
  declarations: [
    MainPaymentComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainPaymentComponent,
  ],
  providers: [
    PaymentVariantService,
  ],
})
export class PaymentModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<MainPaymentComponent> {
    return MainPaymentComponent;
  }
}
