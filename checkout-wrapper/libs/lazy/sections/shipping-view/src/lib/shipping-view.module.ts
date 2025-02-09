import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ShippingModule } from '@pe/checkout/shipping';
import { UtilsModule } from '@pe/checkout/utils';

import { ShippingViewContainerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,

    UtilsModule,

    ShippingModule,
  ],
  declarations: [
    ShippingViewContainerComponent,
  ],
  providers: [
  ],
})
export class ShippingViewModule {
  resolveShippingViewContainerComponent(): Type<ShippingViewContainerComponent> {
    return ShippingViewContainerComponent;
  }
}
