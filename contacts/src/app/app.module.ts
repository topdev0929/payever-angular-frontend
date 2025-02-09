import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxWebstorageModule } from 'ngx-webstorage';
import enDE from '@angular/common/locales/en-DE';
import { CommonModule, registerLocaleData } from '@angular/common';
import { NgxsModule } from '@ngxs/store';

import { PeWidgetsModule } from '@pe/widgets';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { EnvService, MessageBus, PE_ENV } from '@pe/common';
import { AuthModule } from '@pe/auth';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { I18nModule } from '@pe/i18n';
import { EnvironmentConfigInterface } from '@pe/common/environment-config/interfaces/environment-config.interface';
import { PeDataGridSidebarService } from '@pe/data-grid';

import { environment } from '../environments/environment';
import { PlatformHeaderService } from './modules/services/app-platform-header.service';
import { BusinessDataResolver } from './modules/services/business-data.resolver';
import { RootComponent } from './components';
import { COS_ENV, PeEnvInitializer, PeEnvProvider } from './env.provider';
import { AppRoutingModule } from './app-routing.module';
import { SandboxEnv } from './modules/services/env.service';
import { ContactsAuthService, PeContactsAuthService } from './modules/contacts/src/services';
import { ContactsHeaderService } from './modules/contacts/src/services/contacts-header.service';
import { SandboxMessageBus } from './modules/services/message-bus.service';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

registerLocaleData(enDE, 'en-DE');

const imports = [
  AuthModule.forRoot(),
  BrowserModule,
  BrowserAnimationsModule,
  HttpClientModule,
  AppRoutingModule,
  StoreModule.forRoot({}),
  NgxsModule.forRoot(),
  EffectsModule.forRoot([]),
  FormsModule,
  CommonModule,
  MediaModule.forRoot({}),
  NgxWebstorageModule.forRoot(),
  I18nModule.forRoot(),
  HammerModule,
  PePlatformHeaderModule,
  PeWidgetsModule,
];

if (process.env.NODE_ENV !== 'production') {
  imports.push(StoreDevtoolsModule.instrument({
    maxAge: 25,
    logOnly: environment.production,
  }));
}

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
  imports,
  providers: [
    MediaUrlPipe,
    SandboxEnv,
    BusinessDataResolver,
    ContactsHeaderService,
    {
      provide: PePlatformHeaderService,
      useFactory: () => { // Hack providing service for micro apps
        if (!window['pe_PlatformHeaderService']) {
          const service: PlatformHeaderService = new PlatformHeaderService();
          window['pe_PlatformHeaderService'] = service;
          return service;
        }
        return window['pe_PlatformHeaderService'];
      }
    },
    PeDataGridSidebarService,
    SandboxMessageBus,
    {
      provide: MessageBus,
      useExisting: SandboxMessageBus
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: 'PE_CONTACTS_HOST',
      deps: [COS_ENV],
      useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
    },
    {
      provide: PeContactsAuthService,
      useClass: ContactsAuthService,
    },
    {
      provide: 'POS_ENV',
      deps: [COS_ENV],
      useFactory: env => `${env.backend.pos}/api`,
    },
    {
      provide: 'POS_MEDIA',
      deps: [COS_ENV],
      useFactory: env => `${env.custom.storage}/images`,
    },
    {
      provide: 'POS_PRODUCTS_MEDIA',
      deps: [COS_ENV],
      useFactory: env => `${env.custom.storage}/products`,
    },
    {
      provide: 'POS_GOOGLE_MAPS_API_KEY',
      deps: [COS_ENV],
      useFactory: env => env.config.googleMapsApiKey,
    },
    {
      provide: COS_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
    PeEnvProvider,
    PeEnvInitializer,
  ],
  declarations: [
    RootComponent,
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
}
