import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UrlSerializer } from '@angular/router';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { NgxsModule } from '@ngxs/store';

import { EnvironmentConfigInterface, EnvService, MessageBus, PE_ENV } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe, MEDIA_ENV } from '@pe/media';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { AuthModule, AUTH_ENV, PeAuthService } from '@pe/auth';
import { TranslateService } from '@pe/i18n-core';
import { BackgroundActivityService } from '@pe/builder-editor';
import {
  BUILDER_MEDIA_API_PATH,
  MediaService,
  PebActualContextApi,
  PebActualEditorWs,
  PebActualProductsApi,
  PebContextApi,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebProductsApi,
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
} from '@pe/builder-api';
import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import { PeWidgetsModule } from '@pe/widgets';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';

import { CustomUrlSerializer } from '../../modules/subscriptions/src/services/custom-url-serializer.service';
import { BusinessGuard } from '../guards';
import { PeBusinessResolver } from '../resolvers/pe-business-data.resolver';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CosEnvInitializer, CosEnvProvider, COS_ENV } from './env.provider';
import { SandboxEnv } from './sandbox.env';
import { SandboxMessageBus } from '../shared/services/message-bus.service';
import { SandboxTranslateService } from '../shared/services/sandbox-translate.service';
import {
  PEB_SUBSCRIPTION_API_BUILDER_PATH,
  PEB_SUBSCRIPTION_API_PATH,
} from '../../modules/subscriptions/src/constants';
import { ActualPebSubscriptionsThemesApi } from '../../modules/subscriptions/src/api/builder/actual.subscriptions-themes.api';
import { ActualPebSubscriptionsEditorApi } from '../../modules/subscriptions/src/api/builder/actual.subscriptions-editor.api';
import { AbstractSubscriptionBuilderApi } from '../../modules/subscriptions/src/api/builder/abstract-subscriptionsbuilder.api';
import { PebActualSubscriptionBuilderApi } from '../../modules/subscriptions/src/api/builder/actual.subscription-builder.api';
import { TokenInterceptor } from '../dev/token.interceptor';

import { AngularResizedEventModule } from 'angular-resize-event';
import { ApolloModule } from 'apollo-angular';
import 'hammerjs';
import { DragulaModule } from 'ng2-dragula';
import { SubscribtionsApolloConfigModule } from 'src/modules/subscriptions/src/apollo.module';

export const NgxWebstorageModuleForRoot = NgxWebstorageModule.forRoot();
export const I18nModuleForRoot = I18nModule.forRoot({ useStorageForLocale: true });

declare var PayeverStatic: any;

PayeverStatic.IconLoader.loadIcons([
  // 'set',
  'apps',
  // 'industries',
  'settings',
  // 'builder',
  // 'dock',
  // 'edit-panel',
  // 'social',
  // 'dashboard',
  // 'notification',
  // 'commerceos',
  // 'widgets',
  // 'payment-methods',
  // 'payment-plugins',
  // 'shipping',
  // 'finance-express',
]);

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularResizedEventModule,
    SharedModule,
    DragulaModule.forRoot(),
    AuthModule.forRoot(),
    MediaModule.forRoot({}),
    PePlatformHeaderModule,
    HammerModule,
    I18nModule.forRoot(),
    NgxsModule.forRoot(),
    NgxWebstorageModuleForRoot,
    PeWidgetsModule,
    MatIconModule,
    ApolloModule,
    SubscribtionsApolloConfigModule,
    AuthModule,
  ],
  providers: [
    ThemesApi,
    TranslateService,
    BusinessGuard,
    CosEnvProvider,
    CosEnvInitializer,
    MediaUrlPipe,
    PeBusinessResolver,
    BackgroundActivityService,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PE_ENV,
      deps: ['CNF_ENV'],
      useFactory: (env: EnvironmentConfigInterface) => env,
    },
    {
      provide: MEDIA_ENV,
      deps: ['CNF_ENV'],
      useFactory: (env: any) => env,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'subscriptions',
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.builderSubscription,
    },
    {
      provide: PEB_SUBSCRIPTION_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.billingSubscription,
    },

    {
      provide: PEB_SUBSCRIPTION_API_BUILDER_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.builderSubscription,
    },
    {
      provide: 'PE_CONTACTS_HOST',
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.contacts,
    },
    {
      provide: PebEditorWs,
      useClass: PebActualEditorWs,
    },
    {
      provide: 'PEB_SUBSCRIPTION_HOST',
      deps: [COS_ENV],
      useFactory: env => env.primary.subscriptionHost,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShopWs,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },

    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebEditorApi,
      useClass: ActualPebSubscriptionsEditorApi,
    },
    {
      provide: PebThemesApi,
      useClass: ActualPebSubscriptionsThemesApi,
    },
    {
      provide: PebContextApi,
      useClass: PebActualContextApi,
    },

    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: PebContextApi,
      useClass: PebActualContextApi,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: AbstractSubscriptionBuilderApi,
      useClass: PebActualSubscriptionBuilderApi,
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: (env: any) => env,
    },
    {
      provide: AUTH_ENV,
      deps: [COS_ENV],
      useFactory: (env: any) => env,
    },
    {
      provide: PebProductsApi,
      useClass: PebActualProductsApi,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useFactory: (env: any) => env.backend.studio,
      deps: [COS_ENV],
      // useValue: 'https://studio-backend.test.devpayever.com',
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.synchronizer,
    },
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.builderGenerator,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.media,
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.builderMedia,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.custom.storage,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSubscription,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => `${env.backend.shop}'/api'`,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [COS_ENV],
      useFactory: (env: any) => env.backend.products,
    },
    {
      provide: 'POS_GOOGLE_MAPS_API_KEY',
      deps: [COS_ENV],
      useFactory: env => env.config.googleMapsApiKey,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
