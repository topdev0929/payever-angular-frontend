import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { MainPaymentEditComponent } from './payment-edit.component';

@NgModule({
  declarations: [
    MainPaymentEditComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainPaymentEditComponent,
  ],
})
export class PaymentEditModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<MainPaymentEditComponent> {
    return MainPaymentEditComponent;
  }
}
