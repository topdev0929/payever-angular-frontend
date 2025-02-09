import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SandboxRootComponent } from './root/root.component';
import { SandboxFrontRouteComponent } from './root/front.route';
import { SandboxRoutingModule } from './sandbox.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { PE_ENV, PebEnvService, MessageBus, PebTranslateService } from '@pe/common';
import { CosEnvInitializer, CosEnvProvider, COS_ENV } from './env.provider';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TokenInterceptor } from '../dev/token.interceptor';
import { SandboxEnv } from './sandbox.env';
import { SandboxTranslateService } from '../dev/sandbox-transplate.service';
import { I18nModule } from '@pe/i18n';
import { SandboxMessageBus } from '../dev/sandbox-message-bus.service';
import { MEDIA_ENV, MediaModule, MediaUrlPipe } from '@pe/media';
import { AuthModule } from '@pe/auth';
import { PeAffiliatesApi } from '../../../modules/affiliates/src/api/abstract.affiliates.api';
import { SandboxMockBackend } from '../dev/affiliates.api-local';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
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
  declarations: [SandboxFrontRouteComponent, SandboxRootComponent],
  imports: [
    SandboxRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatDatepickerModule,
    MatCheckboxModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    FormsModule,
    MatMomentDateModule,
    AuthModule.forRoot(),
    MatAutocompleteModule,
    I18nModule.forRoot(),
    MediaModule.forRoot({}),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
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
      useFactory: env => env,
    },    
    {
      provide: MEDIA_ENV,
      deps: [COS_ENV],
      useFactory: (env: any) => ({ custom: env.custom, backend: env.backend }),
    },
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PeAffiliatesApi,
      useClass: SandboxMockBackend,
    },
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {}
