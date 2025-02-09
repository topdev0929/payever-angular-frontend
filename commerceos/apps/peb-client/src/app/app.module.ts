import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { PeAppEnv } from '@pe/app-env';
import { 
  PebConnectorProxyService,
  PebDataSourceService,
  PebIntegrationApiHandler,  
  PebIntegrationMockHandler,
} from '@pe/builder/integrations';
import { PebViewCookiesPermissionService } from '@pe/builder/view-handlers';
import { EnvService, PE_ENV, PeDestroyService } from '@pe/common';

import { environment } from '../environments/environment';

import { PebClientAppComponent } from './app.component';
import { PebClientEnv } from './client-env.service';
import {
  PebClientApiService,
  PebClientCheckoutLoaderService,
  PebClientPagesService,
  PebSsrStateService,
} from './services';

@NgModule({
  declarations: [PebClientAppComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule.withServerTransition({ appId: 'peb-client' }),
    BrowserTransferStateModule,
    NgxsModule.forRoot([], { 
      developmentMode: false,
      selectorOptions:{
        injectContainerState: false,
      },
    }),    
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () => {
            const isBrowser = typeof window !== 'undefined';

            return isBrowser
              ? import('./browser.module').then(m => m.BrowserModule)
              : import('./server.module').then(m => m.ServerModule);
          },
        },
      ],
      { initialNavigation: 'enabledBlocking' },
    ),
  ],
  
  providers: [
    {
      provide: PE_ENV,
      useFactory: () => {
        return environment.apis;
      },
    },
    {
      provide: APP_BASE_HREF,
      useFactory: () => typeof window !== 'undefined' ? document.location.origin : '/',
    },
    PebClientEnv,
    {
      provide: PeAppEnv,
      useExisting: PebClientEnv,
    },
    {
      provide: EnvService,
      useExisting: PebClientEnv,
    },
    PebClientApiService,    
    PeDestroyService,
    PebDataSourceService,
    PebConnectorProxyService,
    PebIntegrationMockHandler,
    PebIntegrationApiHandler,
    PebClientPagesService,
    PebSsrStateService,
    PebClientCheckoutLoaderService,
    PebViewCookiesPermissionService,
  ],
  bootstrap: [PebClientAppComponent],
})
export class AppModule {}
