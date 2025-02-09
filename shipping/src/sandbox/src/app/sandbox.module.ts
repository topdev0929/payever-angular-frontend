import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SandboxRootComponent } from './root/root.component';
import { SandboxFrontRoute } from './root/front.route';
import { SandboxRoutingModule } from './sandbox.routing';
import { MatIconModule } from '@angular/material/icon';
import { PE_ENV, EnvService, MessageBus, PebTranslateService } from '@pe/common';
import { CosEnvInitializer, CosEnvProvider, COS_ENV } from './env.provider';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PEB_SHIPPING_API_PATH } from '@pe/shipping-app';
import { TokenInterceptor } from '../dev/token.interceptor';
import { SandboxEnv } from './sandbox.env';
import { SandboxTranslateService } from '../dev/sandbox-transplate.service';
import { I18nModule } from '@pe/i18n';
import { SandboxMessageBus } from '../dev/sandbox-message-bus.service';
import { MEDIA_ENV, MediaModule, MediaUrlPipe } from '@pe/media';
import { AuthModule } from '@pe/auth';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AgmCoreModule } from '@agm/core';
import { NgxWebstorageModule } from 'ngx-webstorage';

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
  'flags',
]);

@NgModule({
  declarations: [SandboxFrontRoute, SandboxRootComponent],
  imports: [
    SandboxRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    MatIconModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    FormsModule,
    AuthModule.forRoot(),
    MatAutocompleteModule,
    I18nModule.forRoot(),
    NgxWebstorageModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDB-7kzuFYxb8resf60yF21TKUkTbGhljc',
      libraries: ['places'],
    }),
    MatGoogleMapsAutocompleteModule,
    MediaModule.forRoot({}),
  ],
  providers: [
    CosEnvInitializer,
    CosEnvProvider,
    MediaUrlPipe,
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: (env) => env,
    },
    {
      provide: PEB_SHIPPING_API_PATH,
      deps: [COS_ENV],
      useFactory: (env) => `${env.backend.shipping}/api`,
    },
    {
      provide: MEDIA_ENV,
      deps: [COS_ENV],
      useFactory: (env: any) => ({ custom: env.custom, backend: env.backend }),
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {}
