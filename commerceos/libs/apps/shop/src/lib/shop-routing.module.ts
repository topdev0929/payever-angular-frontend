import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebPageResolver, PebThemeResolver } from '@pe/builder/resolvers';
import { PeBuilderAppComponent } from '@pe/builder-app';
import { TranslationGuard } from '@pe/i18n';

import { PebShopDashboardComponent } from './dashboard/shop-dashboard.component';
import { PebShopGuard } from './guards/shop.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [TranslationGuard, PebShopGuard],
    component: PeBuilderAppComponent,
    data: {
      i18nDomains: [
        'commerceos-builder-app',
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
            loadChildren: () => import('@pe/builder-app').then(m => m.PeBuilderAppNavModule),
            outlet: 'nav',
          },
          {
            path: 'dashboard',
            resolve: {
              page: PebPageResolver,
            },
            component: PebShopDashboardComponent,
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
            path: 'settings',
            loadChildren: () => import('@pe/builder-app').then(m => m.PeBuilderAppSettingsModule),
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
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class PeShopRoutingModule {
}
