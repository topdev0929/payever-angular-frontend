import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// We can't use @pe/checkout-wrapper-sdk imports now because it adds 200 kb to main.js build size
// import { StorageModule } from '@pe/checkout-wrapper-sdk';
import { StorageModule } from '@pe/checkout/storage';
import { StoreModule } from '@pe/checkout/store';

import {
  CreateFlowComponent,
} from './components';
import { RoutingModule } from './routing.module';



@NgModule({
  imports: [
    CommonModule,
    StorageModule,
    RoutingModule,
    StoreModule,
  ],
  declarations: [
    CreateFlowComponent,
  ],
})
export class CheckoutCreateFlowModule {
}
