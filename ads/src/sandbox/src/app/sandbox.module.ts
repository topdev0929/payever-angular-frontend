import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, InjectionToken, NgModule, Provider } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PE_FORMS_ENV } from '@pe/forms';
import { PE_TRANSLATION_API_URL } from '@pe/i18n';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PeAdsApi } from '../../../modules/ads/src/api/abstract.ads.api';
import { SandboxMockBackend } from '../dev/ads.api-local';

import { TokenInterceptor } from './auth/token.interceptor';
import { SandboxFrontRoute } from './root/front.route';
import { SandboxRootComponent } from './root/root.component';
import { SandboxRouting } from './sandbox.routing';
import { PlatformHeaderService } from './shared/services/app-platform-header.service';
import { SandboxSettingsDialog } from './shared/settings/settings.dialog';

const SANDBOX_ENV = new InjectionToken<any>('SANDBOX_ENV');

export const SandboxEnvProvider: Provider = {
  provide: SANDBOX_ENV,
  useValue: {},
};

export const SandboxEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpClient, SANDBOX_ENV],
  multi: true,
  useFactory: function initEnv(http, env) {
    return () =>
      http
        .get('/env.json')
        .toPromise()
        .then(result => Object.assign(env, result));
  },
};

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CdkPortalModule,
    SandboxRouting,
  ],
  declarations: [
    SandboxRootComponent,
    SandboxFrontRoute,
    SandboxSettingsDialog,
  ],
  providers: [
    SandboxEnvProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PE_TRANSLATION_API_URL,
      useValue: 'https://payevertesting.blob.core.windows.net',
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'ad',
    },
    {
      provide: PE_FORMS_ENV,
      deps: [SANDBOX_ENV],
      useFactory: ({ config, frontend, custom, backend }) => ({
        config: {
          env: config.env,
        },
        frontend: {
          commerceos: frontend.commerceos,
        },
        custom: {
          cdn: custom.cdn,
          storage: custom.storage,
        },
        backend: {
          paymentDataStorage: backend.paymentDataStorage,
          media: backend.media,
        },
      }),
    },
    {
      provide: PeAdsApi,
      useClass: SandboxMockBackend,
    },
    {
      provide: 'PEB_ENV',
      deps: [SANDBOX_ENV],
      useFactory: env => env,
    },
    {
      provide: 'ADS_ENV',
      deps: [SANDBOX_ENV],
      useFactory: env => env.backend.ads + '/api',
    },
    {
      provide: 'ADS_MEDIA',
      deps: [SANDBOX_ENV],
      useFactory: env => env.custom.storage + '/images',
    },
    {
      provide: 'ADS_PRODUCTS_MEDIA',
      deps: [SANDBOX_ENV],
      useFactory: env => env.custom.storage + '/products',
    },
    SandboxEnvInitializer,
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {}
