import { ClipboardModule } from '@angular/cdk/clipboard';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgxsModule } from '@ngxs/store';

import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { BaseModule, CosMessageBus } from '@pe/base';
import {
  MediaService,
  PEB_APPS_API_PATH,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PebEditorAuthTokenService,
  PebWebsocketService,
} from '@pe/builder/api';
import { PebEnvService, PebMediaService } from '@pe/builder/core';
import {
   PebConnectorProxyService,
   PebMockConnector,
   PebProductsConnector,
   PebSettingsConnector,
   PebLanguageConnector,
   PebIntegrationApiService,
   PebIntegrationMockHandler,
   PebIntegrationLanguageHandler,
   PebIntegrationApiHandler,
   PebIntegrationSnackbarHandler,
   PebIntegrationMessageHandler,
} from '@pe/builder/integrations';
import { PebRendererModule } from '@pe/builder/renderer';
import { PebEditorState, PebElementsState, PebPagesState, PebScriptsState, PebShapesState, PebUndoState } from '@pe/builder/state';
import { PeBuilderAppModule } from '@pe/builder-app';
import {
  APP_TYPE,
  AppType,
  EnvironmentConfigInterface,
  EnvService,
  MessageBus,
  NavigationService,
  PE_ENV,
  PeDestroyService,
  PePreloaderService,
  PreloaderState,
} from '@pe/common';
import { PeBuilderDashboardAccessApiService } from '@pe/dashboard';
import { PE_DOMAINS_API_PATH, PE_PRIMARY_HOST, PeDomainsModule } from '@pe/domains';
import {
  PE_FOLDERS_API_PATH,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeFoldersModule,
} from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule, TranslateService } from '@pe/i18n';
import { MediaModule, MediaUrlPipe, PeMediaService, PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PE_OVERLAY_DATA, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { THEMES_API_PATH } from '@pe/themes';
import {
  PebButtonModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebLogoPickerModule,
  PeListModule,
} from '@pe/ui';

import { PeSubscriptionsConnectComponent, PeSubscriptionsNetworkEditorComponent, PeSubscriptionsSettingsComponent } from './components';
import { PeSubscriptionNavComponent } from './components/navigtor/nav.component';
import { PE_SUBSCRIPTIONS_CONTAINER } from './constants';
import { PeSubscriptionsPlanResolver } from './resolvers';
import {
  PeSubscriptionsEnvService,
  PeSubscriptionsHeaderService,
  PeErrorsHandlerService,
  PeSubscriptionsAccessApiService,
  PeSubscriptionsApiService,
  PeSubscriptionsConnectionApiService,
  PeSubscriptionsGridService,
  PeSubscriptionsSidebarService,
} from './services';
import { PeSubscriptionBuilderEnv } from './services/subscription-builder-env.service';
import { PeSubscriptionsRoutingModule } from './subscription-routing.module';
import { PE_ACCESS_API_PATH, PE_CONTACTS_API_PATH, PE_PRODUCTS_API_PATH, PE_SUBSCRIPTIONS_API_PATH } from './tokens';


(window as any).PayeverStatic.IconLoader.loadIcons(['apps', 'settings','set','builder']);


const peServices = [
  CurrencyPipe,
  MediaUrlPipe,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeMediaService,
  PeOverlayWidgetService,
  PePreloaderService,
  TranslateService,
  PeDestroyService,
  {
    provide: PE_OVERLAY_DATA,
    useValue: {},
  },
];

const integrationProviders = [
  PebConnectorProxyService,
  PebMockConnector,
  PebProductsConnector,
  PebSettingsConnector,
  PebLanguageConnector,
  PebIntegrationApiService,
  PebIntegrationMockHandler,
  PebIntegrationLanguageHandler,
  PebIntegrationApiHandler,
  PebIntegrationSnackbarHandler,
  PebIntegrationMessageHandler,
];

const subscriptionsServices = [
  PeErrorsHandlerService,
  PeSubscriptionsAccessApiService,
  PeSubscriptionsApiService,
  PeSubscriptionsConnectionApiService,
  PeSubscriptionsGridService,
  PeSubscriptionsPlanResolver,
  PeSubscriptionsSidebarService,
  NavigationService,
  {
    provide: PeBuilderDashboardAccessApiService,
    useExisting: PeSubscriptionsAccessApiService,
  },
];

const domainsProvides =[
  {
    deps: [PE_ENV],
    provide: PE_DOMAINS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.billingSubscription,
  },
  {
    deps: [PE_ENV],
    provide: PE_PRIMARY_HOST,
    useFactory: (env: EnvironmentConfigInterface) => env.primary.subscriptionHost,
  },
];

const envProvides = [
  {
    provide: EnvService,
    useClass: PeSubscriptionsEnvService,
  },
  {
    provide: PebEnvService,
    useExisting: EnvService,
  },
  {
    provide: PeAppEnv,
    useClass: PeSubscriptionBuilderEnv,
  },
  {
    provide: PebWebsocketService,
    useClass: PebWebsocketService,
    deps: [PeAppEnv],
  },
];

const foldersProvides = [
  {
    deps: [PE_ENV],
    provide: PE_FOLDERS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.billingSubscription + '/api',
  },
];

const mediaProvides = [
  {
    deps: [PE_ENV],
    provide: PE_CUSTOM_CDN_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.custom.cdn,
  },
  {
    deps: [PE_ENV],
    provide: PE_MEDIA_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
  },
  {
    provide: PE_MEDIA_CONTAINER,
    useValue: PE_SUBSCRIPTIONS_CONTAINER,
  },
];

const pebProvides = [
  {
    provide: APP_TYPE,
    useValue: AppType.Subscriptions,
  },
  {
    provide: PebMediaService,
    useClass: MediaService,
  },
  {
    deps: [PeAuthService],
    provide: PebEditorAuthTokenService,
    useFactory: (peAuthService: PeAuthService) => peAuthService,
  },
  {
    deps: [PE_ENV],
    provide: 'PE_CONTACTS_HOST',
    useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
  },
  {
    deps: [PE_ENV],
    provide: PEB_EDITOR_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderSubscription,
  },
  {
    provide: PEB_EDITOR_WS_PATH,
    deps: [PE_ENV],
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderSubscriptionWs,
  },
  {
    deps: [PE_ENV],
    provide: PEB_MEDIA_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
  },
  {
    deps: [PE_ENV],
    provide: PEB_APPS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderSubscription,
  },
  {
    deps: [PE_ENV],
    provide: PEB_STORAGE_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.custom.storage,
  },
  {
    deps: [PE_ENV],
    provide: PEB_STUDIO_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.studio,
  },
  {
    deps: [PE_ENV],
    provide: PEB_SYNCHRONIZER_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.contactsSynchronizer,
  },
];

const peProvides = [
  {
    provide: MessageBus,
    useClass: CosMessageBus,
  },
];

const subscriptionsProvides = [
  PeSubscriptionsHeaderService,
  {
    deps: [PE_ENV],
    provide: PE_ACCESS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.billingSubscription,
  },
  {
    deps: [PE_ENV],
    provide: PE_CONTACTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
  },
  {
    deps: [PE_ENV],
    provide: PE_PRODUCTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.products,
  },
  {
    deps: [PE_ENV],
    provide: PE_SUBSCRIPTIONS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.billingSubscription,
  },
];

const themesProvides = [
  {
    deps: [PE_ENV],
    provide: THEMES_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderSubscription,
  },
];

@NgModule({
  declarations: [
    PeSubscriptionsSettingsComponent,
    PeSubscriptionsConnectComponent,
    PeSubscriptionsNetworkEditorComponent,
    PeSubscriptionNavComponent,
  ],
  imports: [
    // Angular Modules
    CommonModule,
    MatSidenavModule,
    OverlayModule,
    ClipboardModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxsModule.forFeature([
      PeGridState,
      PreloaderState,
      PebEditorState,
      PebPagesState,
      PebElementsState,
      PebUndoState,
      PebScriptsState,
      PebShapesState,
    ]),
    ReactiveFormsModule,
    PeBuilderAppModule,
    // PeModules
    PePlatformHeaderModule,
    BaseModule,
    I18nModule,
    MediaModule.forRoot({}),
    PebRendererModule,
    PebButtonModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebLogoPickerModule,
    PeDomainsModule,
    PeFoldersModule,
    PeGridModule,
    PeListModule,
    PeSubscriptionsRoutingModule,
  ],
  providers: [
    ...peServices,
    ...subscriptionsServices,
    ...domainsProvides,
    ...envProvides,
    ...foldersProvides,
    ...mediaProvides,
    ...pebProvides,
    ...peProvides,
    ...subscriptionsProvides,
    ...themesProvides,
    ...integrationProviders,
  ],
})
export class PeSubscriptionsModule { }
