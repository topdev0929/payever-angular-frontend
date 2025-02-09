import { NgModule } from '@angular/core';

import { PluginsModule as SdkPluginsModule } from '@pe/checkout/plugins';
import { StorageModule as SdkStorageModule } from '@pe/checkout/storage';
import { UtilsModule } from '@pe/checkout/utils';

import { CouponsApiService, CouponsStateService } from './services';

@NgModule({
  imports: [
    UtilsModule,
    SdkStorageModule,
    SdkPluginsModule,
  ],
  providers: [
    CouponsApiService,
    CouponsStateService,
  ],
})
export class CouponsModule {}
