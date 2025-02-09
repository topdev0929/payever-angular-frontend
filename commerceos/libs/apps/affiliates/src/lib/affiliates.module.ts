import { ClipboardModule } from '@angular/cdk/clipboard';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxsModule } from '@ngxs/store';
import { TextMaskModule } from 'angular2-text-mask';

import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { CosMessageBus, BaseModule } from '@pe/base';
import {
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_MEDIA_API_PATH,
  PEB_APPS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PebEditorAuthTokenService,
  PebWebsocketService
} from '@pe/builder/api';
import { PebEnvService } from '@pe/builder/core';
import { PeBuilderAppModule } from '@pe/builder-app';
import {
  APP_TYPE,
  AppType,
  EnvironmentConfigInterface,
  EnvService,
  MessageBus,
  PE_ENV,
  PePreloaderService,
  PreloaderState,
} from '@pe/common';
import { PeBuilderDashboardAccessApiService } from '@pe/dashboard';
import { PE_DOMAINS_API_PATH, PE_PRIMARY_HOST, PeDomainsModule } from '@pe/domains';
import { PeFoldersActionsService, PeFoldersApiService, PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeGridState } from '@pe/grid';
import { CurrencyPipe, TranslateService } from '@pe/i18n';
import { MediaModule, MediaUrlPipe, PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { THEMES_API_PATH } from '@pe/themes';

import { PeAffiliatesRoutingModule } from './affiliates-routing.module';
import {
  PeAffiliatesBankAccountsEditorComponent,
  PeAffiliatesConnectComponent,
  PeAffiliatesNetworkEditorComponent,
  PeAffiliatesProgramEditorComponent,
  PeAffiliatesSettingsComponent,
  PeDatepickerComponent,
} from './components';
import { PeAffiliateNavComponent } from './components/navigtor/nav.component';
import { PE_AFFILIATES_CONTAINER } from './constants';
import { PeAffiliatesProgramResolver } from './resolvers';
import {
  PeAffiliatesEnvService,
  PeAffiliatesHeaderService,
  PeAffiliatesAccessApiService,
  PeAffiliatesApiService,
  PeAffiliatesConnectionApiService,
  PeAffiliatesGridService,
  PeAffiliatesSidebarService,
  PeErrorsHandlerService,
} from './services';
import { PeAffiliateBuilderEnv } from './services/affiliate-builder-env.service';
import { SharedModule } from './shared/shared.module';
import { PE_ACCESS_API_PATH, PE_AFFILIATES_API_PATH, PE_PRODUCTS_API_PATH } from './tokens';


(window as any).PayeverStatic.IconLoader.loadIcons(['apps', 'settings','set','builder']);


const angularServices = [
  MatDialog,
];

const angularModules = [
  CommonModule,
  OverlayModule,
  ClipboardModule,
  FormsModule,
  MatDatepickerModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  NgxsModule.forFeature([PeGridState, PreloaderState]),
  ReactiveFormsModule,
  TextMaskModule,
];

const peModules = [
  PePlatformHeaderModule,
  BaseModule,
  MediaModule.forRoot({}),
  PeDomainsModule,
];

const domainsProvides =[
  {
    deps: [PE_ENV],
    provide: PE_DOMAINS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.affiliates,
  },
  {
    deps: [PE_ENV],
    provide: PE_PRIMARY_HOST,
    useFactory: (env: EnvironmentConfigInterface) => env.primary.affiliatesHost, //shopHost,
  },
];


const envProvides = [
  {
    provide: EnvService,
    useClass: PeAffiliatesEnvService,
  },
  {
    provide: PebEnvService,
    useExisting: EnvService,
  },
  {
    provide: PeAppEnv,
    useClass: PeAffiliateBuilderEnv,
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
    useFactory: (env: EnvironmentConfigInterface) => env.backend.affiliates + '/api',
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
    useValue: PE_AFFILIATES_CONTAINER,
  },
];

const pebProvides = [
  {
    provide: APP_TYPE,
    useValue: AppType.Affiliates,
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
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAffiliate,
  },
  {
    provide: PEB_EDITOR_WS_PATH,
    deps: [PE_ENV],
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAffiliateWs,
  },
  {
    deps: [PE_ENV],
    provide: PEB_MEDIA_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
  },
  {
    deps: [PE_ENV],
    provide: PEB_APPS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAffiliate,
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
  CurrencyPipe,
  MediaUrlPipe,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeOverlayWidgetService,
  PePreloaderService,
  TranslateService,
  {
    provide: MessageBus,
    useClass: CosMessageBus,
  },
];

const affiliatesServices = [
  PeErrorsHandlerService,
  PeAffiliatesAccessApiService,
  PeAffiliatesApiService,
  PeAffiliatesConnectionApiService,
  PeAffiliatesGridService,
  PeAffiliatesProgramResolver,
  PeAffiliatesSidebarService,
  {
    provide: PeBuilderDashboardAccessApiService,
    useExisting: PeAffiliatesAccessApiService,
  },
];

const affiliatesProvides = [
  PeAffiliatesHeaderService,
  {
    deps: [PE_ENV],
    provide: PE_ACCESS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.affiliates + '/api',
  },
  {
    deps: [PE_ENV],
    provide: PE_AFFILIATES_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.affiliates + '/api',
  },
  {
    deps: [PE_ENV],
    provide: PE_PRODUCTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.products,
  },
];

const themesProvides = [
  {
    deps: [PE_ENV],
    provide: THEMES_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAffiliate,
  },
];

@NgModule({
  declarations: [
    PeAffiliateNavComponent,
    PeAffiliatesConnectComponent,
    PeAffiliatesProgramEditorComponent,
    PeAffiliatesNetworkEditorComponent,
    PeAffiliatesSettingsComponent,
    PeDatepickerComponent,
    PeAffiliatesBankAccountsEditorComponent,
  ],
  imports: [
    PeAffiliatesRoutingModule,
    SharedModule,
    PeBuilderAppModule,
    ...angularModules,
    ...peModules,
  ],
  providers: [
    ...angularServices,
    ...affiliatesProvides,
    ...domainsProvides,
    ...envProvides,
    ...foldersProvides,
    ...mediaProvides,
    ...pebProvides,
    ...peProvides,
    ...themesProvides,
    ...affiliatesServices,
  ],
})
export class PeAffiliatesModule { }
