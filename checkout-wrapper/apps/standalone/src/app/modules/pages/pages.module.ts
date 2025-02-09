import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CheckoutWrapperModule } from '@pe/checkout/main';
import { PluginsModule } from '@pe/checkout/plugins';
import { StorageModule } from '@pe/checkout/storage';
import { StoreModule } from '@pe/checkout/store';

import {
  ShowWrapperComponent,
} from './components/show-wrapper';
import {
  SaveGuestTokenGuard,
} from './guards';
import { RoutingModule } from './routing.module';

@NgModule({
  imports: [
    CommonModule,
    PluginsModule,
    StorageModule,
    RoutingModule,
    CheckoutWrapperModule,
    StoreModule,
  ],
  declarations: [
    ShowWrapperComponent,
  ],
  providers: [
    SaveGuestTokenGuard,
  ],
})
export class CheckoutPagesModule {
}
