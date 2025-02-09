import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { LayoutModule } from '../../models';
import { KitLayoutModule } from '../../presentation';

import { OrderHeaderComponent } from './order-header.component';

@NgModule({
  declarations: [
    OrderHeaderComponent,
  ],
  imports: [
    CommonModule,
    KitLayoutModule,
  ],
})
export class OrderHeaderModule implements LayoutModule<OrderHeaderComponent> {
  resolveComponent(): Type<OrderHeaderComponent> {
    return OrderHeaderComponent;
  }
}
