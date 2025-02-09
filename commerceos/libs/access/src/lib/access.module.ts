import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import {
  BUILDER_MEDIA_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PebEditorAuthTokenService,
} from '@pe/builder/api';
import { PebEnvService } from '@pe/builder/core';
import { PE_ENV } from '@pe/common';
import { LoginModule } from '@pe/entry/login';
import { RegistrationModule } from '@pe/entry/registration';
import { EntrySharedModule } from '@pe/entry/shared';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';

import { PeAccessComponent } from './access.component';
import { PeAccessEditorGuard } from './guards/access-editor.guard';
import { PeAccessService } from './services/access.service';
import { PeAccessApiService } from './services/api.service';
import { PeAccessEnvService } from './services/env.service';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    RouterModule.forChild([
      {
        path: ':access',
        component: PeAccessComponent,
        data: { i18nDomains: ['commerceos-app', 'commerceos-widgets-app'] },
        children: [
        ],
      },
    ]),
    PePlatformHeaderModule,
    LoginModule,
    RegistrationModule,
    EntrySharedModule,
  ],
  declarations: [PeAccessComponent],
  providers: [
    PeAccessApiService,
    PeAccessService,
    PeAccessEditorGuard,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PebEnvService,
      useValue: PeAccessEnvService,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => ({
        get token() {
          return authService.token;
        },
        access: null,
      }),
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
      useValue: env => env.backend.studio,
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
  ],
})
export class PeAccessModule {
}
