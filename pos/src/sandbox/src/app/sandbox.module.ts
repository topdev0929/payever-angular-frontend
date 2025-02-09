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
import { SessionStorageService } from 'ngx-webstorage';

import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import {
  BUILDER_MEDIA_API_PATH,
  MediaService,
  PebActualEditorWs,
  PebActualProductsApi,
  PebEditorApi,
  PebEditorWs,
  PebProductsApi,
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
} from '@pe/builder-api';
import {
  ActualBuilderPosApi,
  ActualPosApi,
  BuilderPosApi,
  PebActualEditorApi,
  PebActualPosThemesApi,
  PEB_POS_API_BUILDER_PATH,
  PEB_POS_API_PATH,
  PEB_POS_HOST,
  PosApi,
} from '@pe/builder-pos';
import { AuthModule, AUTH_ENV } from '@pe/auth';
import { EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { TranslateService } from '@pe/i18n-core';
import { NavigationService } from '@pe/connect-app';

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
    NgxIndexedDBModule.forRoot(MockEditorDatabaseConfig),
    AuthModule,
    PePlatformHeaderModule,
    NgxsModule.forRoot(),
  ],
  declarations: [
    SandboxRootComponent,
    SandboxFrontRoute,
    SandboxSettingsDialog,
    SandboxViewerSelectionDialog,
  ],
  providers: [
    SandboxDBService,
    CosEnvInitializer,
    CosEnvProvider,
    TranslateService,
    SessionStorageService,
    {
      provide: NavigationService,
      deps: [ SessionStorageService ],
    },
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: BuilderPosApi,
      useClass: ActualBuilderPosApi,
    },
    {
      provide: PosApi,
      useClass: ActualPosApi,
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
      provide: PebEditorWs,
      useClass: PebActualEditorWs,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualPosThemesApi,
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
      useFactory: env => env.backend.builderPos,
    },
    {
      provide: PEB_POS_API_BUILDER_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderPos,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useFactory: env => env.backend.studio,
      deps: [COS_ENV],
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.synchronizer,
    },
    {
      provide: PEB_POS_HOST,
      deps: [COS_ENV],
      useFactory: env => env.primary.posHost,
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
      provide: 'PEB_ENV',
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: 'POS_ENV',
      deps: [COS_ENV],
      useFactory: env => env.backend.pos + '/api',
    },
    {
      provide: 'POS_MEDIA',
      deps: [COS_ENV],
      useFactory: env => env.custom.storage + '/images',
    },
    {
      provide: 'POS_PRODUCTS_MEDIA',
      deps: [COS_ENV],
      useFactory: env => env.custom.storage + '/products',
    },
    {
      provide: PEB_POS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.pos + '/api',
    },

    /* {
      provide: PEB_SHOPS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.shop + '/api',
    }, */
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'pos',
    },
  ],
  bootstrap: [ SandboxRootComponent ],
})
export class SandboxModule {}
