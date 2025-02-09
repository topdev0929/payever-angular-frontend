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

import { MessageBus, PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import {
  BUILDER_MEDIA_API_PATH,
  MediaService,
  PebActualBlogsApi,
  PebActualBlogThemesApi,
  PebActualContextApi,
  PebActualEditorApi,
  PebActualProductsApi,
  PebBlogsApi,
  PebContextApi,
  PebEditorApi,
  PebProductsApi,
  PebThemesApi,
  PEB_BLOG_API_PATH,
  PEB_EDITOR_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
} from '@pe/builder-api';
import { PEB_BLOG_HOST } from '@pe/builder-blog';
import { AuthModule, AUTH_ENV } from '@pe/auth';
import { PE_ENV } from '@pe/common';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { BackgroundActivityService } from '@pe/builder-editor';

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
import { TranslateService } from '@pe/i18n-core';
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
    BackgroundActivityService,
    TranslateService,
    {
      provide: PebBlogsApi,
      useClass: PebActualBlogsApi,
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
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualBlogThemesApi,
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
      useFactory: env => env.backend.builderBlog,
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
      provide: PEB_BLOG_HOST,
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
      provide: PEB_BLOG_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.blog + '/api',
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
      useValue: 'blog',
    },
  ],
  bootstrap: [ SandboxRootComponent ],
})
export class SandboxModule {}
