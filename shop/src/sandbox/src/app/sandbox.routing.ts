import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SandboxFrontRoute } from './root/front.route';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SandboxFrontRoute,
  },
  {
    path: 'shop',
    loadChildren: () => import('@pe/builder-shop').then(
      m => m.PebShopModule,
    ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
        enableTracing: false,
        relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [
    RouterModule,
  ],
})
export class SandboxRouting { }
