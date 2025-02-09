import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RefreshTokenGuard } from '@pe/auth';

import {
  RestoreFlowFromPaymentCodeComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    canActivate: [RefreshTokenGuard],
    children: [
      {
        path: ':code',
        component: RestoreFlowFromPaymentCodeComponent,
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
