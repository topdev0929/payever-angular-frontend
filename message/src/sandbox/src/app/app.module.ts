import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpBackend, HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';

import { AuthModule } from '@pe/auth';
import { EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n-core';
import { PE_MEDIA_API_PATH, PE_MESSAGE_API_PATH, PE_PRODUCTS_API_PATH, PeMessageEnvService } from '@pe/message';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SandboxMessageBus } from './services/message-bus.service';

(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'commerceos',
  'messaging',
  'set',
]);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    OverlayModule,

    AuthModule,
    AuthModule.forRoot(),
    PePlatformHeaderModule,
  ],
  providers: [
    PeDataGridService,
    TranslateService,
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: EnvService,
      useClass: PeMessageEnvService,
    },
    {
      provide: PE_ENV,
      useValue: {},
    },
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: APP_INITIALIZER,
      deps: [HttpBackend, PE_ENV],
      multi: true,
      useFactory: (httpBackend: HttpBackend, env: any) => {
        return () => new HttpClient(httpBackend).get('env.json').toPromise().then((result: any) => { Object.assign(env, result); });
      },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: PE_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.media,
    },
    {
      provide: PE_MESSAGE_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.message,
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.products,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
