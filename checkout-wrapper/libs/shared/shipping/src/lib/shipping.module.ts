import { NgModule } from '@angular/core';

import { ApiService as SdkApiService } from '@pe/checkout/api';
import { PluginsModule as SdkPluginsModule } from '@pe/checkout/plugins';
import { ProductsStateService } from '@pe/checkout/products';
import { StorageModule as SdkStorageModule } from '@pe/checkout/storage';
import { UtilsModule } from '@pe/checkout/utils';

import { ShippingApiService, ShippingStateService, ShippingConverterService } from './services';

// This way we make sure that when we have 2 checkouts: one as lib in COSF and another as custom element in POS and
//  they are both together in the memory:
// In this case they don't have same shared global services (rxjs conflicts in this case)
const win = (window as any)[`checkout_sdk_shipping_${Math.random().toString().slice(2)}`] = {} as any;

export function shippingStateServiceFactory(
  apiService: ShippingApiService,
  converterService: ShippingConverterService,
  sdkApiService: SdkApiService,
  productsStateService: ProductsStateService
): ShippingStateService {
  if (!win.pe_CheckoutWrapper_ShippingStateService) {
    win.pe_CheckoutWrapper_ShippingStateService = new ShippingStateService(
      apiService,
      converterService,
      sdkApiService,
      productsStateService,
    );
  }

  return win.pe_CheckoutWrapper_ShippingStateService;
}

@NgModule({
  imports: [
    UtilsModule,
    SdkStorageModule,
    SdkPluginsModule,
  ],
  providers: [
    ShippingApiService,
    ShippingConverterService,
    {
      provide: ShippingStateService, useFactory: shippingStateServiceFactory,
      deps: [ShippingApiService, ShippingConverterService, SdkApiService, ProductsStateService],
    },
  ],
})
export class ShippingModule {
}
