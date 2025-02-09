import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { NgxsModule } from '@ngxs/store';
import { FormBuilder } from '@angular/forms';

import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import {
  BUILDER_MEDIA_API_PATH,
  MediaService,
  PebActualEditorWs,
  PebActualProductsApi,
  PebContextApi,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebProductsApi,
  PEB_EDITOR_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
} from '@pe/builder-api';
import {
  PebActualContextApi,
  PebActualEditorApi,
  PebActualShopsApi,
  PebShopsApi,
  PEB_SHOPS_API_PATH,
  PEB_SHOP_HOST,
} from '@pe/builder-shop';
import { AuthModule, AUTH_ENV, PeAuthService } from '@pe/auth';
import { EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { BackgroundActivityService } from '@pe/builder-editor';
import { I18nModule } from '@pe/i18n';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebTextEditorService } from '@pe/builder-text-editor';
import { MediaService as Media, MEDIA_ENV } from '@pe/media';
import { PeDataGridService } from '@pe/data-grid';
import { PeAlertDialogModule } from '@pe/alert-dialog';

import { SandboxSettingsDialog } from './shared/settings/settings.dialog';
import { SandboxFrontRoute } from './root/front.route';
import { SandboxRootComponent } from './root/root.component';
import { SandboxRouting } from './sandbox.routing';
import { SandboxMessageBus } from './shared/services/message-bus.service';
import { SandboxViewerSelectionDialog } from './root/dialogs/viewer-selection.dialog';
import { MockEditorDatabaseConfig } from '../dev/editor.idb-config';
import { SandboxEnv } from './sandbox.env';
import { SandboxDBService } from '../dev/sandbox-idb.service';
import { SandboxTranslateService } from '../dev/sandbox-translate.service';
import { TokenInterceptor } from '../dev/token.interceptor';
import { CosEnvInitializer, CosEnvProvider, COS_ENV } from './env.provider';
import { PlatformHeaderService } from '../dev/platform-header.service';
// import { ActualPebSitesThemesApi } from '../../../modules/site/src/service/builder/actual.sites-themes.api';
// import { ActualPebSitesEditorApi } from '../../../modules/site/src/service/builder/actual.sites-editor.api';
// import {AbstractSiteBuilderApi} from '../../../modules/site/src/service/builder/abstract.builder.api';
// import {PebActualSiteBuilderApi} from '../../../modules/site/src/service/builder/actual.site-builder.api';

declare var PayeverStatic: any;

PayeverStatic.IconLoader.loadIcons([
  'set',
  'apps',
  'industries',
  'settings',
  'builder',
  'dock',
  'edit-panel',
  'social',
  'dashboard',
  'notification',
  'commerceos',
  'widgets',
  'payment-methods',
  'payment-plugins',
  'shipping',
  'finance-express',
]);

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
    NgxsModule.forRoot(),
    I18nModule.forRoot(),
    NgxIndexedDBModule.forRoot(MockEditorDatabaseConfig),
    AuthModule,
    PePlatformHeaderModule,
    PeAlertDialogModule,
  ],
  declarations: [
    SandboxRootComponent,
    SandboxFrontRoute,
    SandboxSettingsDialog,
    SandboxViewerSelectionDialog,
  ],
  providers: [
    FormBuilder,
    SandboxDBService,
    PeDataGridService,
    CosEnvInitializer,
    CosEnvProvider,
    BackgroundActivityService,
    ThemesApi,
    PeOverlayWidgetService,
    Media,
    PebTextEditorService,
    {
      provide: MEDIA_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: PebShopsApi,
      useClass: PebActualShopsApi,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PePlatformHeaderService,
      useFactory: () => {
        // Hack providing service for micro apps
        const w = window as any;
        if (!w.pe_PlatformHeaderService) {
          const service = new PlatformHeaderService();
          w.pe_PlatformHeaderService = service;
          return service;
        } else {
          return w.pe_PlatformHeaderService;
        }
      },
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: PebContextApi,
      useClass: PebActualContextApi,
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: AUTH_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: PebProductsApi,
      useClass: PebActualProductsApi,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PebEditorWs,
      deps: [PEB_EDITOR_API_PATH],
      useClass: PebActualEditorWs,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useExisting: auth => auth,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useFactory: env => env.backend.studio,
      deps: [COS_ENV],
      // useValue: 'https://studio-backend.test.devpayever.com',
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.synchronizer,
    },
    {
      provide: PEB_SHOP_HOST,
      deps: [COS_ENV],
      useFactory: env => env.primary.shopHost,
    },
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderGenerator,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.media,
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderMedia,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [COS_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'shop',
    },
    {
      provide: MEDIA_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
  ],
  bootstrap: [ SandboxRootComponent ],
})
export class SandboxModule {}
