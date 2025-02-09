import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { PeCouponsGridComponent } from './routes/grid/coupons-grid.component';
import { PeCouponsRootComponent } from './routes/root/coupons-root.component';

const routes: Routes = [
  {
    path: '',
    component: PeCouponsRootComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        component: PeCouponsGridComponent,
      },
    ],
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['coupons-app', 'ng-kit-ng-kit'],
    },
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const routerModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [routerModuleForChild],
  exports: [RouterModule],
  providers: [],
})
export class PeCouponsRouteModule {}
