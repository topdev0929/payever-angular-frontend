import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { StorageModule } from '@pe/checkout/storage';
import { StoreModule } from '@pe/checkout/store';
import { UtilsModule } from '@pe/checkout/utils';

import { CreateFlowFromApiCallComponent } from './components';
import { RoutingModule } from './routing.module';


@NgModule({
  imports: [
    CommonModule,
    StorageModule,
    UtilsModule,
    RoutingModule,
    StoreModule,
  ],
  declarations: [
    CreateFlowFromApiCallComponent,
  ],
})
export class CheckoutCreateFlowFromApiCallModule {
}
