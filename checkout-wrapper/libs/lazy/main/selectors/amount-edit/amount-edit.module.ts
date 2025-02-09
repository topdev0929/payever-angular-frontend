import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { AmountEditComponent } from './amount-edit.component';

@NgModule({
  declarations: [
    AmountEditComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    AmountEditComponent,
  ],
})
export class AmountEditModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<AmountEditComponent> {
    return AmountEditComponent;
  }
}
