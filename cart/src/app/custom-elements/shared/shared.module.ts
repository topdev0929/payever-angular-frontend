import { NgModule } from '@angular/core';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthModule } from '@pe/ng-kit/modules/auth';
import { StatisticsModule as SdkStatisticsModule } from '@pe/checkout-sdk/sdk/statistics';
import { WrapperAndPaymentsApiModule as SdkApiModule } from '@pe/checkout-sdk/sdk/api';
import { StorageModule as SdkStorageModule } from '@pe/checkout-sdk/sdk/storage';
import { PluginsModule as SdkPluginsModule } from '@pe/checkout-sdk/sdk/plugins';

import { StateService, OrderInventoryService } from './services';

@NgModule({
  imports: [
    NgxWebstorageModule,
    AuthModule.forRoot(),
    SdkStatisticsModule.forRoot(),
    SdkApiModule,
    SdkStorageModule,
    SdkPluginsModule
  ],
  exports: [
    SdkStatisticsModule
  ],
  providers: [
    StateService,
    OrderInventoryService
  ]
})
export class SharedModule {
}
