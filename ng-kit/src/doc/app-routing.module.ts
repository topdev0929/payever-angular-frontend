import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthModule } from '../kit/auth/src/auth.module';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/components',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true}),
    AuthModule.forRoot()
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
