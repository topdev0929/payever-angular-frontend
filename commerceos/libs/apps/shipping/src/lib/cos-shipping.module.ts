import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { PebTranslateService } from '@pe/builder/core';
import { PE_ENV, PeDestroyService, EnvService, MessageBus, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';

import { PEB_SHIPPING_API_PATH } from './enums/constants';
import { ShippingEnvService } from './root/shipping-env.service';
import { CosShippingRootComponent } from './root/shipping-root.component';
import { AmgEnvService } from './services/amg-env-provider.service';
import { EnvironmentConfigService } from './services/environment-config.service';
import { CosMessageBus } from './services/message-bus.service';
import { PeShippingHeaderService } from './services/shipping-header.service';

const routes: Route[] = [
  {
    path: '',
    component: CosShippingRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./shipping.module').then(m => m.PebShippingModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    MatGoogleMapsAutocompleteModule,
    AgmCoreModule.forRoot(),
  ],
  declarations: [CosShippingRootComponent],
  providers: [
    PeOverlayWidgetService,
    NavigationService,
    PeShippingHeaderService,
    PeDestroyService,
    {
      provide: PebTranslateService,
      useClass: TranslateService,
    },
    {
      provide: PEB_SHIPPING_API_PATH,
      deps: [PE_ENV],
      useFactory: env => `${env.backend.shipping}/api`,
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: EnvService,
      useClass: ShippingEnvService,
    },
    {
      provide: LAZY_MAPS_API_CONFIG,
      useClass: AmgEnvService,
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
export class CosShippingModule {}
