import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  PebPageResolver,
  PebThemeResolver,
} from '@pe/builder/resolvers';
import { PeBuilderAppComponent } from '@pe/builder-app';
import { TranslationGuard } from '@pe/i18n-core';

import {
  PeSubscriptionsConnectComponent,
  PeSubscriptionsProgramsComponent,
  PeSubscriptionsSettingsComponent,
} from './components';
import { PeSubscriptionNavComponent } from './components/navigtor/nav.component';
import { PeSubscriptionsEnvGuard, PeSubscriptionsNetworkGuard } from './guards';
import { PeSubscriptionsPlanResolver } from './resolvers';


const routes: Routes = [
  {
    path: '',
    component: PeBuilderAppComponent,
    canActivate: [
      TranslationGuard,
      PeSubscriptionsEnvGuard,
      PeSubscriptionsNetworkGuard,
    ],
    data: {
      i18nDomains: [
        'commerceos-subscriptions-app',
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
            component: PeSubscriptionNavComponent,
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
            path: 'connect',
            component: PeSubscriptionsConnectComponent,
          },
          {
            path: 'programs/:planId',
            component: PeSubscriptionsProgramsComponent,
            resolve: {
              plan: PeSubscriptionsPlanResolver,
            },
            data: {
              isDetailsView: true,
            },
          },
          {
            path: 'programs',
            loadChildren: () => import('./components/programs/programs.module')
              .then(m => m.PeSubscriptionsProgramsModule),
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
            path: 'settings',
            component: PeSubscriptionsSettingsComponent,
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: ['commerceos-domains-lib'],
            },
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
        ],
      },
    ],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [
    PeSubscriptionsEnvGuard,
    PeSubscriptionsNetworkGuard,
  ],
})
export class PeSubscriptionsRoutingModule { }
