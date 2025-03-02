import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  PeCouponsComponent,
  PeCouponsGridComponent,
} from './components';
import { CouponsResolver } from './resolver/coupons.resolver';

const routes: Routes = [
  {
    path: '',
    component: PeCouponsComponent,
    children: [
      {
        path: ':couponId/details',
        component: PeCouponsGridComponent,
        resolve: {
          coupon: CouponsResolver,
        },
        data: {
          isDetailsView: true,
        },
      },
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
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeCouponsRoutingModule {}
