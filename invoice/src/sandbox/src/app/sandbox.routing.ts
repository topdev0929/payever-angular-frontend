import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'invoice'
  },
  // {
  //   path: 'actions',
  //   loadChildren: () => import('./+actions/actions.module').then(
  //     m => m.SandboxActionsModule,
  //   ),
  // },
  {
    path: 'invoice',
    loadChildren: () => import('@pe/invoice').then(
      m => m.PeInvoiceModule
    )
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false
    })
  ],
  exports: [
    RouterModule
  ]
})
export class SandboxRouting { }
