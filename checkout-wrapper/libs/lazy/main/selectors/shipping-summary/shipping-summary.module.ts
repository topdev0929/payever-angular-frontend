import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { ShippingSummaryComponent } from './shipping-summary.component';

@NgModule({
  declarations: [
    ShippingSummaryComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ShippingSummaryComponent,
  ],
})
export class ShippingSummaryModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<ShippingSummaryComponent> {
    return ShippingSummaryComponent;
  }
}
