import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  PebPageResolver,
  PebThemeResolver,
} from '@pe/builder/resolvers';
import { PeBuilderAppComponent } from '@pe/builder-app';
import { TranslationGuard } from '@pe/i18n-core';

import { PeAppointmentNavComponent } from './components/navigtor/nav.component';
import { PeAppointmentsEnvGuard, PeAppointmentsNetworkGuard, PeAppointmentsThemesGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    component: PeBuilderAppComponent,
    canActivate: [
      PeAppointmentsEnvGuard,
      TranslationGuard,
      PeAppointmentsNetworkGuard,
    ],
    data: {
      i18nDomains: [
        'commerceos-appointments-app',
        'commerceos-themes-app',
      ],
    },
    children: [
      {
        path: ':app',
        resolve: {
          theme: PebThemeResolver,
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: '',
            loadChildren: () => import('@pe/builder-app').then(m => m.PeBuilderAppHeaderModule),
            outlet: 'header',
          },
          {
            path: '',
            component: PeAppointmentNavComponent,
            outlet: 'nav',
          },
          {
            path: 'dashboard',
            resolve: {
              page: PebPageResolver,
            },
            loadChildren: () => import('@pe/builder-app').then(m => m.PeBuilderAppDashboardModule),
          },
          {
            path: 'edit',
            resolve: {
              page: PebPageResolver,
            },
            loadChildren: () => import('@pe/builder/main-editor').then(m => m.PebMainEditorModule),
          },
          {
            path: 'themes',
            loadChildren: () => import('@pe/themes').then(m => m.PebThemesModule),
          },
          {
            path: 'calendar',
            loadChildren: () => import('./components/calendar/calendar.module')
              .then(m => m.PeAppointmentsCalendarModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-folders-app',
                'commerceos-grid-app',
                'commerceos-media-app',
              ],
            },
          },
          {
            path: 'availability',
            loadChildren: () => import('./components/availability/availability.module')
              .then(m => m.PeAppointmentsAvailabilityModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-folders-app',
                'commerceos-grid-app',
                'commerceos-media-app',
              ],
            },
          },
          {
            path: 'types',
            loadChildren: () => import('./components/types/types.module')
              .then(m => m.PeAppointmentsTypesModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-folders-app',
                'commerceos-grid-app',
              ],
            },
          },
          {
            path: 'settings',
            loadChildren: () => import('./components/settings/settings.module')
              .then(m => m.PeAppointmentsSettingsModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: ['commerceos-domains-lib'],
            },
          },

        ],
      },
    ],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [
    PeAppointmentsEnvGuard,
    PeAppointmentsNetworkGuard,
    PeAppointmentsThemesGuard,
  ],
})
export class PeAppointmentsRoutingModule { }
