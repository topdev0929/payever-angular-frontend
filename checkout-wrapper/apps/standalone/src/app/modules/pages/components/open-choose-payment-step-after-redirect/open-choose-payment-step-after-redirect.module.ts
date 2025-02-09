import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OpenChoosePaymentStepAfterRedirectComponent } from './open-choose-payment-step-after-redirect.component';

const routes: Routes = [
  {
    path: '',
    component: OpenChoosePaymentStepAfterRedirectComponent,
  },
];

@NgModule({
  declarations: [
    OpenChoosePaymentStepAfterRedirectComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    OpenChoosePaymentStepAfterRedirectComponent,
  ],
})
export class OpenChoosePaymentStepAfterRedirectModule {}
