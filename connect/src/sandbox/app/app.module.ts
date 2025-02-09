import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DragulaModule } from 'ng2-dragula';
import { AngularResizedEventModule } from 'angular-resize-event';
import 'hammerjs';
import 'hammer-timejs';

import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthModule, AUTH_ENV } from '@pe/auth';
import { I18nModule, LANG, PE_TRANSLATION_API_URL } from '@pe/i18n';
import { MicroModule, PE_ENV } from '@pe/common';
import { PE_FORMS_ENV } from '@pe/forms';
import { MEDIA_ENV } from '@pe/media';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';

import { PeSimpleStepperModule } from '@pe/stepper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MicroReturnComponent } from './components';
import { SharedModule } from '../shared/shared.module';
import { PebRendererModule } from '@pe/builder-renderer';
import { SnackbarService } from '@pe/snackbar';

export const AuthModuleForRoot = AuthModule.forRoot();
export const NgxWebstorageModuleForRoot = NgxWebstorageModule.forRoot();
export const I18nModuleForRoot = I18nModule.forRoot({ useStorageForLocale: true });

@NgModule({
  declarations: [
    AppComponent,
    MicroReturnComponent
  ],
  imports: [
    AuthModuleForRoot,
    AuthModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxWebstorageModuleForRoot,
    PePlatformHeaderModule,
    DragulaModule,
    AngularResizedEventModule,
    AppRoutingModule,
    HttpClientModule,
    I18nModuleForRoot,
    MicroModule,
    SharedModule,
    PeSimpleStepperModule,
    HammerModule,
    PebRendererModule.forRoot({elements: {}}),
  ],
  bootstrap: [ AppComponent ],
  providers: [
    SnackbarService,
    {
      provide: PE_ENV,
      deps: ['CNF_ENV'],
      useFactory: config => config,
    },
    {
      provide: LANG,
      useValue: 'en',
    },
    {
      provide: AUTH_ENV,
      deps: ['CNF_ENV'],
      useFactory: config => config,
    },
    {
      provide: MEDIA_ENV,
      deps: ['CNF_ENV'],
      useFactory: config => config,
    },
    {
      provide: PE_FORMS_ENV,
      deps: ['CNF_ENV'],
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
      provide: PE_TRANSLATION_API_URL, // TODO Do we need it?
      useValue: 'https://payevertesting.blob.core.windows.net',
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
  ]
})
export class AppModule { }
