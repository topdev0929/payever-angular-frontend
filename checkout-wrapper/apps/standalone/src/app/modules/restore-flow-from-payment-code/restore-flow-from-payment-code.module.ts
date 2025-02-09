import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { StorageModule } from '@pe/checkout/storage';
import { StoreModule } from '@pe/checkout/store';

import {
  RestoreFlowFromPaymentCodeComponent,
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
    RestoreFlowFromPaymentCodeComponent,
  ],
})
export class RestoreFlowFromPaymentCodeModule {
}
