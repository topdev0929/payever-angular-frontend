import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PeAppEnv } from '@pe/app-env';
import { PebWebsocketService } from '@pe/builder/api';
import { PebEnvService } from '@pe/builder/core';
import {
  PebConnectorProxyService,
  PebIntegrationApiHandler,
  PebIntegrationApiService,  
  PebIntegrationLanguageHandler,
  PebIntegrationMessageHandler,
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
import { PeBuilderAppModule } from '@pe/builder-app';
import { PeSiteEnv } from '@pe/builder-settings';
import { APP_TYPE, AppType, PeDestroyService, PePreloaderService } from '@pe/common';
import { PE_FOLDERS_API_PATH, PeFoldersActionsService, PeFoldersApiService } from '@pe/folders';

import { PeSiteGuard } from './guards/site.guard';
import { PeSiteRoutingModule } from './site-routing.module';

const integrationProviders = [  
  PebConnectorProxyService,
  PebMockConnector,
  PebProductsConnector,
  PebSettingsConnector,
  PebLanguageConnector,
  PebPagesConnector,
  PebMessageConnector,
  PebIntegrationApiService,
  PebIntegrationMockHandler,
  PebIntegrationLanguageHandler,
  PebIntegrationApiHandler,
  PebIntegrationSnackbarHandler,
  PebIntegrationSnackbarHandler,
  PebIntegrationMessageHandler,
];

@NgModule({
  imports: [
    CommonModule,
    PeBuilderAppModule,
    PeSiteRoutingModule,
  ],
  providers: [
    PeDestroyService,
    PePreloaderService,
    MatDialog,
    {
      provide: PeAppEnv,
      useClass: PeSiteEnv,
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
      useValue: AppType.Site,
    },
    PeFoldersActionsService,
    PeFoldersApiService,
    PeSiteGuard,
    PePreloaderService,
    {
      provide: PebPageParamsResolver,
      useClass: PebUrlParamsResolver,
    },
    ...integrationProviders,
  ],
})
export class PeSiteModule {
  constructor(
    private languageHandler: PebIntegrationLanguageHandler,
    private snackbarHandler: PebIntegrationSnackbarHandler,
  ) {
  }
}
