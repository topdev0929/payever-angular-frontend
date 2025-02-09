import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebPageResolver, PebThemeResolver } from '@pe/builder/resolvers';
import { PeBuilderAppComponent } from '@pe/builder-app';
import { TranslationGuard } from '@pe/i18n-core';

import {
  PeAffiliatesConnectComponent,
  PeAffiliatesProgramsComponent,
  PeAffiliatesSettingsComponent,
} from './components';
import { PeAffiliateNavComponent } from './components/navigtor/nav.component';
import { PeAffiliatesEnvGuard, PeAffiliatesNetworkGuard, PeAffiliatesThemesGuard } from './guards';
import { PeAffiliatesProgramResolver } from './resolvers';


const routes: Routes = [
  {
    path: '',
    component: PeBuilderAppComponent,
    canActivate: [
      PeAffiliatesEnvGuard,
      TranslationGuard,
      PeAffiliatesNetworkGuard,
    ],
    data: {
      i18nDomains: [
        'commerceos-affiliates-app',
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
            component: PeAffiliateNavComponent,
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
            path: 'connect',
            component: PeAffiliatesConnectComponent,
          },
          {
            path: 'programs/:programId',
            component: PeAffiliatesProgramsComponent,
            resolve: {
              program: PeAffiliatesProgramResolver,
            },
            data: {
              isDetailsView: true,
            },
          },
          {
            path: 'programs',
            loadChildren: () => import('./components/programs/programs.module').then(m => m.PeAffiliatesProgramsModule),
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
            component: PeAffiliatesSettingsComponent,
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-domains-lib',
              ],
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
    PeAffiliatesEnvGuard,
    PeAffiliatesNetworkGuard,
    PeAffiliatesThemesGuard,
  ],
})
export class PeAffiliatesRoutingModule { }
