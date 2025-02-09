import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MicroReturnComponent } from './components';

const appRoutes: Routes = [
  {
    path: 'business/:businessUuid/connect',
    // loadChildren: () => import('../../modules/connect/src/connect/connect.module').then(m => m.ConnectModule),
    loadChildren: () => import('../../modules/connect/src/connect/connect.module').then(m => {
      return m.ConnectModule;
    }),
    data: {
      useMicroUrlsFromRegistry: true,
    }
  },
  {
    path: '**',
    component: MicroReturnComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
