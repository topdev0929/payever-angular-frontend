import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BusinessGuard } from '../guards';

const appRoutes: Routes = [
  {
    path: 'business/:slug',
    canActivate: [BusinessGuard],
    data: {},
    children: [
      {
        path: 'subscriptions',
        loadChildren: () =>
          import('../../modules/subscriptions/src/subscriptions.module').then(m => m.PeSubscriptionsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
