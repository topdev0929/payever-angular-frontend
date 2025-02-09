import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PeAppEnv } from '@pe/app-env';
import { PebWebsocketService } from '@pe/builder/api';
import { PebEnvService } from '@pe/builder/core';
import { PebBackgroundFormService } from '@pe/builder/forms';
import {
  PebCheckoutConnector,
  PebConnectorProxyService,
  PebIntegrationApiHandler,
  PebIntegrationApiService,  
  PebIntegrationLanguageHandler,
  PebIntegrationMockHandler,
  PebIntegrationSnackbarHandler,
  PebLanguageConnector,
  PebMessageConnector,
  PebMockConnector,
  PebPageParamsResolver,
  PebPagesConnector,
  PebProductsConnector,
  PebSettingsConnector,
  PebUrlParamsResolver,
} from '@pe/builder/integrations';
import { PebCreateShapeService } from '@pe/builder/shapes';
import { PeBuilderAppModule } from '@pe/builder-app';
import { PeShopEnv } from '@pe/builder-settings';
import { APP_TYPE, AppType, PeDestroyService, PePreloaderService } from '@pe/common';
import { PeFoldersActionsService, PeFoldersApiService, PE_FOLDERS_API_PATH } from '@pe/folders';
import { PebCheckoutEventHandler , PeSharedCheckoutModule } from '@pe/shared/checkout';

import { PebShopDashboardComponent } from './dashboard/shop-dashboard.component';
import { PebShopGuard } from './guards/shop.guard';
import { PeShopRoutingModule } from './shop-routing.module';

const integrationProviders = [  
  PebConnectorProxyService,
  PebMockConnector,
  PebProductsConnector,
  PebSettingsConnector,
  PebCheckoutConnector,
  PebMessageConnector,
  PebLanguageConnector,
  PebPagesConnector,
  PebIntegrationApiService,
  PebIntegrationMockHandler,
  PebIntegrationLanguageHandler,
  PebIntegrationApiHandler,
  PebIntegrationSnackbarHandler,
  PebCheckoutEventHandler,
  PebIntegrationSnackbarHandler,
];

@NgModule({
  declarations: [
    PebShopDashboardComponent,
  ],
  imports: [
    CommonModule,
    PeBuilderAppModule,
    PeShopRoutingModule,
    PeSharedCheckoutModule.withConfig({ generatePaymentCode: false }),
  ],
  providers: [
    PeDestroyService,
    PePreloaderService,
    MatDialog,
    {
      provide: PeAppEnv,
      useClass: PeShopEnv,
    },
    {
      provide: PebWebsocketService,
      useClass: PebWebsocketService,
      deps: [PeAppEnv],
    },
    {
      deps: [PeAppEnv],
      provide: PebEnvService,
      useFactory: env => ({ ...env, businessId: env.business }),
    },
    {
      deps: [PeAppEnv],
      provide: PE_FOLDERS_API_PATH,
      useFactory: (env: PeAppEnv) => env.api + '/api',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Shop,
    },
    PebShopGuard,
    PeFoldersActionsService,
    PeFoldersApiService,
    PePreloaderService,
    {
      provide: PebPageParamsResolver,
      useClass: PebUrlParamsResolver,
    },
    ...integrationProviders,
    PebIntegrationMockHandler,
    PebIntegrationLanguageHandler,
    PebIntegrationApiHandler,
    PebIntegrationSnackbarHandler,
    PebCheckoutEventHandler,
    PebCreateShapeService,
    PebBackgroundFormService,
  ],
})
export class PeShopModule {
  constructor(
    private checkoutHandler: PebCheckoutEventHandler,
    private languageHandler: PebIntegrationLanguageHandler,
    private snackbarHandler: PebIntegrationSnackbarHandler,
  ) {
  }
}
