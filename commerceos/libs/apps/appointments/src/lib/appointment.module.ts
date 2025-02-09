import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxsModule } from '@ngxs/store';


import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { CosMessageBus } from '@pe/base';
import {
  MediaService,
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
import { PebEnvService, PebMediaService } from '@pe/builder/core';
import { PebEditorState, PebElementsState, PebPagesState, PebScriptsState, PebShapesState, PebUndoState } from '@pe/builder/state';
import { PeBuilderAppModule } from '@pe/builder-app';
import { APP_TYPE, AppType, EnvironmentConfigInterface, EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PeBuilderDashboardAccessApiService } from '@pe/dashboard';
import { PE_DOMAINS_API_PATH, PE_PRIMARY_HOST } from '@pe/domains';
import { PeFoldersModule, PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { THEMES_API_PATH } from '@pe/themes';

import { PeAppointmentsRoutingModule } from './appointments-routing.module';
import { PeAppointmentNavComponent } from './components/navigtor/nav.component';
import { CosAppointmentsRootComponent } from './root';
import {
  PeAppointmentsAccessApiService,
  PeAppointmentsEnvService,
  PeAppointmentsHeaderService,
  PeAppointmentsNetworksApiService,
  PeAppointmentsSidebarService,
  PeErrorsHandlerService,
} from './services';
import { PeAppointmentsBuilderEnv } from './services/appointments-builder-env.service';
import { PE_ACCESS_API_PATH, PE_APPOINTMENTS_API_PATH, PE_CONTACTS_API_PATH, PE_PRODUCTS_API_PATH } from './tokens';

(window as any).PayeverStatic.IconLoader.loadIcons(['apps', 'settings', 'set', 'builder']);

const angularModules = [
  CommonModule,
  CommonModule,
  MatIconModule,
];

const peModules = [
  PePlatformHeaderModule,
  I18nModule,
  PeFoldersModule,
  PeGridModule,
];

const domainsProvides =[
  {
    deps: [PE_ENV],
    provide: PE_DOMAINS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments,
  },
  {
    deps: [PE_ENV],
    provide: PE_PRIMARY_HOST,
    useFactory: (env: EnvironmentConfigInterface) => 'payever.appointments', //env.primary.appointmentsHost,
  },
];

const envProvides = [
  {
    provide: EnvService,
    useClass: PeAppointmentsEnvService,
  },
  {
    provide: PebEnvService,
    useExisting: EnvService,
  },
  {
    provide: PeAppEnv,
    useClass: PeAppointmentsBuilderEnv,
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
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments + '/api',
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
    useValue: AppType.Appointments,
  },
];

const pebProvides = [
  {
    provide: APP_TYPE,
    useValue: AppType.Appointments,
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
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAppointment,
  },
  {
    deps: [PE_ENV],
    provide: PEB_EDITOR_WS_PATH,
    useFactory: (env: EnvironmentConfigInterface) => 'wss://builder-appointments.test.devpayever.com/ws',
  },
  {
    deps: [PE_ENV],
    provide: PEB_MEDIA_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
  },
  {
    deps: [PE_ENV],
    provide: PEB_APPS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAppointment,
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

const appointmentsProvides = [
  PeAppointmentsHeaderService,
  {
    deps: [PE_ENV],
    provide: PE_ACCESS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments,
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
    provide: PE_APPOINTMENTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments,
  },
];

const themesProvides = [
  {
    deps: [PE_ENV],
    provide: THEMES_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAppointment,
  },
];

const angularServices = [
  CurrencyPipe,
  TitleCasePipe,
  MatDialog,
];

const appointmentsServices = [
  PeErrorsHandlerService,
  PeAppointmentsAccessApiService,
  PeAppointmentsNetworksApiService,
  PeAppointmentsSidebarService,
  {
    provide: PeBuilderDashboardAccessApiService,
    useExisting: PeAppointmentsAccessApiService,
  },
];

@NgModule({
  declarations: [
    CosAppointmentsRootComponent,
    PeAppointmentNavComponent,
  ],
  imports: [
    PeAppointmentsRoutingModule,
    PeBuilderAppModule,
    NgxsModule.forFeature([
      PebEditorState,
      PebPagesState,
      PebElementsState,
      PebUndoState,
      PebScriptsState,
      PebShapesState,
    ]),
    ...angularModules,
    ...peModules,
  ],
  providers: [
    ...domainsProvides,
    ...envProvides,
    ...foldersProvides,
    ...mediaProvides,
    ...pebProvides,
    ...peProvides,
    ...appointmentsProvides,
    ...themesProvides,
    ...angularServices,
    ...appointmentsServices,
  ],
})
export class PeAppointmentsModule { }
