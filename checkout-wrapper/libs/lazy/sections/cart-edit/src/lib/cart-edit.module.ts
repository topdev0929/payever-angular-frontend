import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { CouponsModule } from '@pe/checkout/coupons';
import { UtilsModule } from '@pe/checkout/utils';

import { CartEditContainerComponent, CounterComponent } from './components';
import { StateService, OrderInventoryService } from './services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    UtilsModule,
    CouponsModule,
  ],
  declarations: [
    CartEditContainerComponent,
    CounterComponent,
  ],
  providers: [
    StateService,
    OrderInventoryService,
  ],
})
export class CartEditModule {
  resolveCartEditContainerComponent(): Type<CartEditContainerComponent> {
    return CartEditContainerComponent;
  }
}
