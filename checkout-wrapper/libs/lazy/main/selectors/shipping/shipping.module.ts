import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { ShippingComponent } from './shipping.component';


@NgModule({
  declarations: [
    ShippingComponent,
  ],
  imports: [
    CommonModule,
    UiModule,
    UtilsModule,
  ],
  exports: [
    ShippingComponent,
  ],
})
export class ShippingModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<ShippingComponent> {
    return ShippingComponent;
  }
}
