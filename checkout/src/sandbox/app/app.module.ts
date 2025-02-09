import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AngularResizedEventModule } from 'angular-resize-event';
import 'hammerjs';
import 'hammer-timejs';

import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthModule, AUTH_ENV } from '@pe/auth';
import { I18nModule, PE_TRANSLATION_API_URL } from '@pe/i18n';
import { MicroModule, PE_ENV } from '@pe/common';
import { PE_FORMS_ENV } from '@pe/forms';
import { MEDIA_ENV } from '@pe/media';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { PebRendererModule } from '@pe/builder-renderer';

import { PeSimpleStepperModule } from '@pe/stepper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MicroReturnComponent } from './components';
import { SharedModule } from '../shared/shared.module';
import {
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PebEditorApi
} from '@pe/builder-api';
import { ActualPebEditorApi, PEB_SITE_API_BUILDER_PATH, PEB_SITE_API_PATH, PEB_SITE_HOST } from './services/editor.api';
import { PebEnvService } from '@pe/builder-core';
import { SandboxEnv } from './services/sandbox.env';

@NgModule({
  declarations: [
    AppComponent,
    MicroReturnComponent
  ],
  imports: [
    AuthModule.forRoot(),
    AuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxWebstorageModule.forRoot(),
    PePlatformHeaderModule,
    AngularResizedEventModule,
    AppRoutingModule,
    HttpClientModule,
    I18nModule.forRoot({ useStorageForLocale: true }),
    MicroModule,
    SharedModule,
    PeSimpleStepperModule,
    HammerModule,
    PebRendererModule.forRoot({elements: {}}),
  ],
  bootstrap: [ AppComponent ],
  providers: [
    {
      provide: PE_ENV,
      deps: ['CAF_ENV'],
      useFactory: config => config,
    },
    {
      provide: AUTH_ENV,
      deps: ['CAF_ENV'],
      useFactory: config => config,
    },
    {
      provide: MEDIA_ENV,
      deps: ['CAF_ENV'],
      useFactory: config => config,
    },
    {
      provide: PE_FORMS_ENV,
      deps: ['CAF_ENV'],
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
          errorNotification: backend.errorNotification
        },
      }),
    },
    {
      provide: PE_TRANSLATION_API_URL, // TODO Do we need it?
      useValue: 'https://payevertesting.blob.core.windows.net',
    },
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.backend.builderGenerator,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.backend.media,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.custom.storage,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.backend.products,
    },
    {
      provide: PEB_SITE_API_BUILDER_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PEB_SITE_API_PATH,
      deps: ['CAF_ENV'],
      useFactory: env => env.backend.site,
    },
    {
      provide: PEB_SITE_HOST,
      deps: ['CAF_ENV'],
      useFactory: env => env.primary.siteHost,
    },
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PebEditorApi,
      useClass: ActualPebEditorApi,
    },
  ]
})
export class AppModule { }
