import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { ApiService } from '@pe/api';
import { AppType, APP_TYPE, EnvService, PE_ENV } from '@pe/common';
import { TranslationGuard } from '@pe/i18n-core';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebMessagesModule } from '@pe/ui';


import { SettingsEnvGuard } from './env.guard';
import { CosEnvInitializer, CosEnvProvider } from './misc/constants';
import { CosNextRootComponent } from './root/next-root.component';
import { AmgEnvService, BusinessEnvService, EnvironmentConfigService } from './services';
import { PeSettingsHeaderService } from './services/settings-header.service';


const routes: Route[] = [
  {
    path: '',
    component: CosNextRootComponent,
    canActivate: [TranslationGuard, SettingsEnvGuard],
    children: [{
      path: '',
      loadChildren: () => import('./settings.module').then(m => m.SettingsModule),
    }],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    MatGoogleMapsAutocompleteModule,
    AgmCoreModule.forRoot(),
    PebMessagesModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    CosNextRootComponent,
  ],
  providers: [
    CosEnvInitializer,
    CosEnvProvider,
    ApiService,
    {
      provide: LAZY_MAPS_API_CONFIG,
      useClass: AmgEnvService,
    },
    {
      provide: PeSettingsHeaderService,
      useClass: PeSettingsHeaderService,
    },
    {
      provide: EnvService,
      useClass: BusinessEnvService,
    },
    SettingsEnvGuard,
    {
      provide: APP_TYPE,
      useValue: AppType.Settings,
    },
    {
      provide: EnvironmentConfigService,
      deps: [PE_ENV],
      useFactory (env) {
        const service = new EnvironmentConfigService();
        service.addConfig(env);

        return service;
      },
    },
  ],
})
export class CosNextSettingsModule { }
