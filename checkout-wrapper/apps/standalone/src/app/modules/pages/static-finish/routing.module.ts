import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExternalNavigateDataQueryGuard } from '../../../guards';

import {
  FlowCommonFinishStaticSuccessComponent,
  FlowCommonFinishStaticFailComponent,
  FlowCommonFinishStaticCancelComponent,
  FlowSantanderDePosFinishStaticSuccessComponent,
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
        component: FlowCommonFinishStaticSuccessComponent,
        canActivate: [ExternalNavigateDataQueryGuard],
      },
      {
        path: 'fail',
        component: FlowCommonFinishStaticFailComponent,
        canActivate: [ExternalNavigateDataQueryGuard],
      },
      {
        path: 'cancel',
        component: FlowCommonFinishStaticCancelComponent,
        canActivate: [ExternalNavigateDataQueryGuard],
      },
      {
        path: 'santander-de-pos-success',
        component: FlowSantanderDePosFinishStaticSuccessComponent,
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
