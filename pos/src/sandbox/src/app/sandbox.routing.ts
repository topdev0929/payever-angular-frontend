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
    path: 'pos',
    loadChildren: () => import('@pe/builder-pos').then(
      m => m.PebPosModule,
    ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
    }),
  ],
  exports: [
    RouterModule,
  ],
})
export class SandboxRouting { }
