import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';


import { ShippingModule } from '@pe/checkout/shipping';
import { UtilsModule } from '@pe/checkout/utils';

import { ShippingEditContainerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    UtilsModule,
    ShippingModule,
  ],
  declarations: [
    ShippingEditContainerComponent,
  ],
  providers: [
  ],
})
export class ShippingEditModule {
  resolveShippingEditContainerComponent(): Type<ShippingEditContainerComponent> {
    return ShippingEditContainerComponent;
  }
}
