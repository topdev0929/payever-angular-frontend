import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { CosMessageBus } from '@pe/base';
import { BaseDashboardModule } from '@pe/base-dashboard';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  MediaService,
  PEB_MEDIA_API_PATH,
  BUILDER_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PEB_PRODUCTS_API_PATH,
} from '@pe/builder/api';
import { PebMediaService } from '@pe/builder/core';
import { PE_ENV, EnvService, MessageBus } from '@pe/common';
import { DockerModule } from '@pe/docker';
import { PeHeaderModule, PlatformHeaderService } from '@pe/header';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { BusinessGuard, EmployeesPermissionService } from '@pe/shared/business';
import { PebEnvironmentService } from '@pe/shared/env-service';
import { EditWidgetsService, EditWidgetsApiService } from '@pe/shared/widget';
import { PeStepperModule, PeStepperService } from '@pe/stepper';
import { UserModule } from '@pe/user';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    I18nModule.forChild(),
    MatButtonModule,
    BaseDashboardModule,
    UserModule,
    PeHeaderModule,
    PeStepperModule,
    PePlatformHeaderModule,
    DockerModule,
  ],
  providers: [
    PeStepperService,
    BusinessGuard,
    EmployeesPermissionService,
    EditWidgetsService,
    EditWidgetsApiService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: EnvService,
      useClass: PebEnvironmentService,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.media,
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMedia,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useValue: env=>env.backend.studio,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [PE_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.synchronizer,
    },

    {
      provide: 'PEB_ENV',
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: 'POS_ENV',
      deps: [PE_ENV],
      useFactory: env => env.backend.pos + '/api',
    },
    {
      provide: 'POS_MEDIA',
      deps: [PE_ENV],
      useFactory: env => env.custom.storage + '/images',
    },
    {
      provide: 'POS_PRODUCTS_MEDIA',
      deps: [PE_ENV],
      useFactory: env => env.custom.storage + '/products',
    },

    {
      provide: 'POS_GOOGLE_MAPS_API_KEY',
      deps: [PE_ENV],
      useFactory: env => env.config.googleMapsApiKey,
    },
  ],
})
export class DashboardModule {
 }
