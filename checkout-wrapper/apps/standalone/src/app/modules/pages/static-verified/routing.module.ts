import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExternalNavigateDataQueryGuard } from '../../../guards';

import {
  FlowVerifiedStaticFailComponent,
  FlowVerifiedStaticSuccessComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    children: [
      // These pages are added for case when we need to redirect user when contract is signed
      // It happens in few days and payment flow already remove. This is why we use just static pages.
      // As I remember it's only for Norway
      {
        path: 'success',
        component: FlowVerifiedStaticSuccessComponent,
        canActivate: [ExternalNavigateDataQueryGuard],
      },
      {
        path: 'fail',
        component: FlowVerifiedStaticFailComponent,
        canActivate: [ExternalNavigateDataQueryGuard],
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class RoutingModule {
}
