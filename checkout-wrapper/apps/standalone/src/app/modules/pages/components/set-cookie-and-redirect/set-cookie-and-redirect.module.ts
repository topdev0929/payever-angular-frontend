import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SetCookieAndRedirectComponent } from './set-cookie-and-redirect.component';

const routes: Routes = [
  {
    path: '',
    component: SetCookieAndRedirectComponent,
  },
];

@NgModule({
  declarations: [
    SetCookieAndRedirectComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    SetCookieAndRedirectComponent,
  ],
})
export class SetCookieAndRedirectModule {}
