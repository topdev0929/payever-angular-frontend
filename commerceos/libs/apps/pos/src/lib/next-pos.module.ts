import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, RouterModule } from '@angular/router';

import { AuthStubService } from '@pe/auth';
import { PE_ENV, EnvService, NavigationService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { SnackBarService } from '@pe/forms';
import { TranslationGuard } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebMessagesModule } from '@pe/ui';

import { PE_PRODUCTS_API_PATH, PEB_POS_API_PATH, PEB_POS_HOST } from './constants';
import { PosEnvGuard } from './env.guard';
import { CosNextRootComponent } from './root/next-root.component';
import {
  PosApi,
  PosEnvService,
  PePosHeaderService,
} from './services';


const routes: Route[] = [
  {
    path: '',
    component: CosNextRootComponent,
    canActivate: [PosEnvGuard, TranslationGuard],
    data: {
      i18nDomains: [
        'connect-integrations',
      ],
    },
    children: [{
      path: '',
      loadChildren: () => import('./pos.module').then(m => m.PebPosModule),
    }],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PebMessagesModule,
  ],
  declarations: [
    CosNextRootComponent,
  ],
  providers: [
    PeOverlayWidgetService,
    AuthStubService,
    PosEnvGuard,
    PePosHeaderService,
    SnackBarService,
    MatSnackBar,
    PeDataGridService,
    NavigationService,
    {
      provide: EnvService,
      useClass: PosEnvService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'pos',
    },
    {
      provide: PEB_POS_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.posHost,
    },
    {
      provide: PEB_POS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.pos + '/api',
    },
    {
      provide: PosApi,
      useClass: PosApi,
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.products,
    },
  ],
})
export class CosNextPosModule { }
