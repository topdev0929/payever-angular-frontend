import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebCampaignCreateComponent } from './routes/create/campaign-create.component';
import { PebCampaignGridComponent } from './routes/grid/campaign-grid.component';
import { PebShopSettingsComponent } from './routes/settings/campaign-settings.component';
import { PebShopComponent } from './routes/_root/mail-root.component';
import { PebShopGeneralSettingsComponent } from './routes/settings/general/campaign-general-settings.component';
import { PebShopEditComponent } from './routes/edit/campaign-edit.component';
import { PebShopDashboardComponent } from './routes/dashboard/campaign-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: PebShopComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        component: PebCampaignGridComponent,
      },
      {
        path: 'create',
        component: PebCampaignCreateComponent,
      },
      {
        path: 'edit',
        component: PebShopEditComponent,
      },
      // {
      //   path: 'dashboard',
      //   component: PebShopDashboardComponent,
      //   canActivate: [ ShopThemeGuard ]
      // },
      // {
      //   path: 'settings',
      //   component: PebShopSettingsComponent,
      //   resolve: [ ShopResolver ],
      //   children: [
      //     {
      //       path: '',
      //       component: PebShopGeneralSettingsComponent,
      //     },
      //     {
      //       path: 'local-domain',
      //       component: PebShopLocalDomainSettingsComponent,
      //     },
      //     {
      //       path: 'external-domain',
      //       component: PebShopExternalDomainSettingsComponent,
      //     },
      //     {
      //       path: 'password',
      //       component: PebShopPasswordSettingsComponent,
      //     },
      //   ],
      // },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [
    // ShopThemeGuard
  ]
})
export class PebShopRouteModule {}
