import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebShopComponent } from './routes/_root/shop-root.component';
import { ShopThemeGuard } from './guards/theme.guard';
import { PebShopDashboardComponent } from './routes/dashboard/shop-dashboard.component';
import { PebShopSettingsComponent } from './routes/settings/shop-settings.component';
import { PebShopThemesComponent } from './routes/themes/shop-themes.component';
import { PebShopGuard } from './guards/shop.guard';
import { PebShopEditorRouteModule } from './routes/editor/shop-editor.module';

export function shopEditorRoute() {
  return PebShopEditorRouteModule;
}

const routes: Routes = [
  {
    path: '',
    component: PebShopComponent,
    canActivate: [PebShopGuard],
    children: [
      {
        path: ':shopId',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebShopDashboardComponent,
            canActivate:[ShopThemeGuard],
          },
          {
            path: 'edit',
            loadChildren: shopEditorRoute,
          },
          {
            path: 'settings',
            component: PebShopSettingsComponent,

          },
          {
            path: 'themes',
            component: PebShopThemesComponent,
          },
          {
            path: 'builder/:themeId/edit',
            loadChildren: shopEditorRoute,
          },
        ],
      },
    ],
  },
];

// // HACK: fix --prod build
// // https://github.com/angular/angular/issues/23609
export const routerModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [routerModuleForChild],
  exports: [RouterModule],
  providers: [
    ShopThemeGuard,
  ],
})
export class PebShopRouteModule { }
