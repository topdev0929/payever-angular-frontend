import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RedirectOutOfIframeComponent } from './redirect-out-of-iframe.component';

const routes: Routes = [
  {
    path: '',
    component: RedirectOutOfIframeComponent,
  },
];

@NgModule({
  declarations: [
    RedirectOutOfIframeComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RedirectOutOfIframeComponent,
  ],
})
export class RedirectOutOfIframeModule {}
