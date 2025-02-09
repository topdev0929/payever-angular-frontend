import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { MainChoosePaymentMethodComponent } from './choose-payment-method.component';

@NgModule({
  declarations: [
    MainChoosePaymentMethodComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainChoosePaymentMethodComponent,
  ],
})
export class ChoosePaymentMethodModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<MainChoosePaymentMethodComponent> {
    return MainChoosePaymentMethodComponent;
  }
}
