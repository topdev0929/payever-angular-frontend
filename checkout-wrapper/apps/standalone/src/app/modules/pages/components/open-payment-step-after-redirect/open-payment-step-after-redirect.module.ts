import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OpenPaymentStepAfterRedirectComponent } from './open-payment-step-after-redirect.component';

const routes: Routes = [
  {
    path: '',
    component: OpenPaymentStepAfterRedirectComponent,
  },
];

@NgModule({
  declarations: [
    OpenPaymentStepAfterRedirectComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    OpenPaymentStepAfterRedirectComponent,
  ],
})
export class OpenPaymentStepAfterRedirectModule {}
