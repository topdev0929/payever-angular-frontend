import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SandboxFrontRouteComponent } from './root/front.route';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SandboxFrontRouteComponent,
  },
  {
    path: 'affiliate',
    loadChildren: () => import('@pe/affiliates').then(m => m.PebAffiliatesModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
    }),
  ],
  exports: [RouterModule],
})
export class SandboxRoutingModule {}
