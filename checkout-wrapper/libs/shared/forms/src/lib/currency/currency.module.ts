import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { InputCurrencyMaskDirective } from './input-currency-mask.directive';

@NgModule({
  declarations: [
    InputCurrencyMaskDirective,
  ],
  imports: [
    ReactiveFormsModule,
  ],
  exports: [
    InputCurrencyMaskDirective,
  ],
})
export class CheckoutFormsInputCurrencyModule {}
