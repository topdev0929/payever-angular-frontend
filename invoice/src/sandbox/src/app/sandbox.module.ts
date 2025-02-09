import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_STORAGE_PATH,
  PRODUCTS_API_PATH,
  PebActualProductsApi,
  PebEditorApi,
  BUILDER_MEDIA_API_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PebProductsApi,
  PEB_EDITOR_API_PATH,
  PebThemesApi,
  PEB_SHOPS_API_PATH,
  PebEditorWs,
  PebActualEditorWs,
  PEB_EDITOR_WS_PATH,
} from '@pe/builder-api';
import {
  MessageBus,
  PebEnvService,
  PebMediaService,
  PebTranslateService
} from '@pe/builder-core';
import { EnvService, MessageBus as _MessageBus } from '@pe/common';
import { MediaService, MEDIA_ENV } from '@pe/media';

import { SandboxTranslateService } from '../dev/sandbox-translate.service';
import { CosEnvInitializer, CosEnvProvider, COS_ENV } from './env.provider';
import { SandboxRootComponent } from './root/root.component';
import { SandboxEnv } from './sandbox.env';
import { SandboxRouting } from './sandbox.routing';
import { SandboxMessageBus } from './shared/services/message-bus.service';
import { PE_ENV } from '@pe/common';
import { ActualPeInvoiceApi, PEB_INVOICE_API_PATH, PEB_INVOICE_BUILDER_API_PATH, PeInvoiceApi } from 'src/modules/invoice/src';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-editor';
import { PeActualInvoiceEditor } from 'src/modules/invoice/src';
import { ActualPebInvoiceThemesApi } from 'src/modules/invoice/src';
import { AbstractInvoiceBuilderApi, PebActualInvoiceBuilderApi } from 'src/modules/invoice/src';
import { TokenInterceptor } from '../dev/token.interceptor';
import { AuthModule, AUTH_ENV } from '@pe/auth';
import { TranslateService } from '@pe/i18n';
import { NgxsModule } from '@ngxs/store';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';
import { PeDataGridService } from '@pe/data-grid';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { PE_CONTACTS_HOST } from '@pe/contacts';
import { SnackbarService } from '@pe/snackbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';

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
  'finance-express'
]);



@NgModule({
  imports: [
    NgxsModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    AuthModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatDialogModule,
    CdkPortalModule,
    SandboxRouting,
  ],
  declarations: [SandboxRootComponent],
  providers: [
    BackgroundActivityService,
    SnackbarService,
    MatSnackBar,
    TranslateService,
    PeDataGridService,
    MediaService,
    CosEnvInitializer,
    CosEnvProvider,
    {
      provide: ThemesApi,
      useClass: ActualPebInvoiceThemesApi,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: MEDIA_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PebEditorWs,
      deps: [PEB_EDITOR_API_PATH],
      useClass: PebActualEditorWs,
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus
    },
    {
      provide: _MessageBus,
      useClass: SandboxMessageBus
    },
    {
      provide:PeInvoiceApi,
      useClass:ActualPeInvoiceApi,
    },
    {
      provide:PebThemesApi,
      useClass:ActualPebInvoiceThemesApi
    },
    {
      provide:AbstractInvoiceBuilderApi,
      useClass:PebActualInvoiceBuilderApi,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide:"PEB_ENTITY_NAME",
      useValue:"invoice"
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [
        BackgroundActivityService,
        PEB_EDITOR_API_PATH,
      ],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: AUTH_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      useFactory: env => env.backend.media,
      deps: [PE_ENV]
     },
    {
      provide: PebEditorApi,
      useClass: PeActualInvoiceEditor,
    },
    {
      provide: PebProductsApi,
      useClass: PebActualProductsApi,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useFactory: env => env.backend.studio,
      deps: [PE_ENV]
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      useFactory: env => env.backend.sync,
      deps: [PE_ENV]
    },
    // INVOICE API
    {
      provide: PEB_INVOICE_API_PATH,
      useFactory: env => env.backend.invoice,
      deps: [PE_ENV]
    },
    {
      provide: PEB_INVOICE_BUILDER_API_PATH,
      useFactory: env => env.backend.builderInvoice,
      deps: [PE_ENV]
    },
    /**
     * Products API
     */
    {
      provide: PebMediaService,
      useClass: PebActualProductsApi

    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.media,
    },

    /**
     * Other APIs. Need to be made more configurable
     */
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.builderGenerator,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [COS_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [COS_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: 'PE_CONTACTS_HOST',
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.contacts,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShopWs,
    },
    {
      provide: PE_CONTACTS_HOST,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.contacts,
    },
  ],
  bootstrap: [SandboxRootComponent]
})
export class SandboxModule {}
