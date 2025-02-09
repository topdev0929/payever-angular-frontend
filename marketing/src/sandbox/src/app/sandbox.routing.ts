import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'mail'
  },
  // {
  //   path: 'actions',
  //   loadChildren: () => import('./+actions/actions.module').then(
  //     m => m.SandboxActionsModule,
  //   ),
  // },
  {
    path: 'mail',
    loadChildren: () => import('@pe/builder-mail').then(
      m => m.PebMailModule,
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
