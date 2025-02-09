import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n-core';

import { PebBusinessGuard, SettingsAccessGuard } from './guards';
import { LoadingResolver } from './resolvers';
import { PebSettingsComponent } from './routes/_root/settings-root.component';
import { SettingsRoutesEnum } from './settings-routes.enum';

const routes: Routes = [
  {
    path: ``,
    component: PebSettingsComponent,
    canActivate: [TranslationGuard, PebBusinessGuard, SettingsAccessGuard],
    resolve: {
      load: LoadingResolver,
    },
    data: {
      i18nDomains: ['commerceos-settings-app'],
    },
    children: [
      {
        path: `${SettingsRoutesEnum.Info}`,
        loadChildren: () => import('./routes/business-info').then(m => m.BusinessInfoModule),
      },
      {
        path: `${SettingsRoutesEnum.Details}`,
        loadChildren: () => import('./routes/business-detail').then(m => m.BusinessDetailModule),
      },
      {
        path: `${SettingsRoutesEnum.Employees}`,
        loadChildren: () => import('./routes/employees').then(m => m.EmployeesModule),
      },
      {
        path: `${SettingsRoutesEnum.Wallpaper}`,
        loadChildren: () => import('./routes/wallpapers').then(m => m.WallpapersModule),
      },
      {
        path: `${SettingsRoutesEnum.Policies}`,
        loadChildren: () => import('./routes/policies').then(m => m.PoliciesModule),

      },
      {
        path: `${SettingsRoutesEnum.General}`,
        loadChildren: () => import('./routes/general').then(m => m.GeneralModule),
      },
      {
        path: `${SettingsRoutesEnum.Appearance}`,
        loadChildren: () => import('./routes/appearance').then(m => m.AppearanceModule),
      },
      {
        path: `${SettingsRoutesEnum.Billing}`,
        loadChildren: () => import('./routes/billing').then(m => m.BillingModule),
      },
    ],
  },
];
export const settingsRouterModule = RouterModule.forChild(routes);
// @dynamic
@NgModule({
  imports: [settingsRouterModule],
  exports: [RouterModule],
  providers: [
  ],
})
export class SettingsRoutingModule { }
