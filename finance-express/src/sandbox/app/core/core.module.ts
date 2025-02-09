import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';
import { HammerModule } from '@angular/platform-browser';

import { PE_ENV } from '@pe/common';
import { MEDIA_ENV } from '@pe/media';
import { MessageBus } from '@pe/builder-core';
import { AUTH_ENV, AuthModule } from '@pe/auth';
import { PE_FORMS_ENV, SnackBarService } from '@pe/forms';
import { I18nModule, PE_TRANSLATION_API_URL } from '@pe/i18n';

import { FinexpApiService } from './finexp-api.service';
import {
  FinexpApiAbstractService,
  FinexpHeaderAbstractService,
  FinexpStorageAbstractService
} from '../../../modules/finexp-editor/src/services';
import { FinexpStorageService } from './finexp-storage.service';
import { HeaderService } from './header.service';
import { BUSINESS_UUID } from './tokens';
import { SandboxMessageBus } from './message-bus.service';

import 'hammerjs';
import 'hammer-timejs';

export const I18n = I18nModule.forRoot();

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AuthModule.forRoot(),
    AuthModule,
    I18n,
    HammerModule
  ],
  exports: [],
  declarations: [],
  providers: [
    Overlay,
    SnackBarService,
    MatSnackBar,
    {
      provide: PE_ENV,
      deps: ['FINEXP_ENV'],
      useFactory: config => config,
    },
    {
      provide: AUTH_ENV,
      deps: ['FINEXP_ENV'],
      useFactory: config => config,
    },
    {
      provide: MEDIA_ENV,
      deps: ['FINEXP_ENV'],
      useFactory: config => config,
    },
    {
      provide: PE_TRANSLATION_API_URL,
      useValue: 'https://payevertesting.blob.core.windows.net',
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
        },
      }),
    },
    {
      provide: BUSINESS_UUID,
      useFactory: () => {
        return window.location.pathname.split('/')[2];
      },
    },
    {
      provide: FinexpApiAbstractService,
      useClass: FinexpApiService
    },
    {
      // TODO Use factory to create single instance of service
      provide: FinexpStorageAbstractService,
      useClass: FinexpStorageService
    },
    {
      provide: FinexpHeaderAbstractService,
      useClass: HeaderService
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    }
  ]
})
export class CoreModule {}
