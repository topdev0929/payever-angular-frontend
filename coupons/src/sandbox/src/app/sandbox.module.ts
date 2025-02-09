import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { EnvService, MessageBus } from '@pe/common';
import { AuthModule, AUTH_ENV } from '@pe/auth';
import { I18nModule } from '@pe/i18n';
import {
  PePlatformHeaderModule,
  PePlatformHeaderService,
  PlatformHeaderFakeService,
} from '@pe/platform-header';

import { SandboxRootComponent } from './root/root.component';
import { SandboxRouting } from './sandbox.routing';
import { SandboxEnv } from './sandbox.env';
import { SandboxMessageBus } from './shared/services/message-bus.service';
import { PeEnvInitializer, PeEnvProvider } from './env.provider';
import { PeCouponsApi } from '../../../modules/coupons/src/services/abstract.coupons.api';
import {
  ActualPeCouponsApi,
  PE_COUPONS_API_PATH,
} from '../../../modules/coupons/src/services/actual.coupons.api';
import { TokenInterceptor } from '../dev/token.interceptor';
import { PlatformHeaderService } from '../dev/platform-header.service';

declare var PayeverStatic: any;
PayeverStatic.IconLoader.loadIcons(['shipping', 'set']);


@NgModule({
  imports: [
    AuthModule,
    AuthModule.forRoot(),
    I18nModule.forRoot({ useStorageForLocale: true }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    MatDialogModule,
    CdkPortalModule,
    SandboxRouting,
    PePlatformHeaderModule,
  ],
  declarations: [SandboxRootComponent],
  providers: [
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: PeCouponsApi,
      useClass: ActualPeCouponsApi,
    },
    {
      provide: PE_COUPONS_API_PATH,
      useValue: 'https://coupons-backend.test.devpayever.com',
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'coupons',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: AUTH_ENV,
      deps: ['CNF_ENV'],
      useFactory: config => config,
    },
    PeEnvProvider,
    PeEnvInitializer,
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {}
