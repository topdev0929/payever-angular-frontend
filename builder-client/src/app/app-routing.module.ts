import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';
import { MerchantModeGuard } from './guards';

const appRoutes: Routes = [
  {
    path: '',
    canActivate: [ EnvironmentConfigGuard, MerchantModeGuard ],
    loadChildren: '../modules/client/client.module#BuilderClientModule'
    // NOTE: does not  work with SSR () => import('../modules/client/client.module').then(m => m.BuilderClientModule)
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      enableTracing: false,
      initialNavigation: 'enabled', // NOTE: need for SSR
      scrollPositionRestoration: 'top'
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
