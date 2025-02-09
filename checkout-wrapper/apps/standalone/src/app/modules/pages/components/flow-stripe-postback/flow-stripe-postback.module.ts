import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlowStripePostbackComponent } from './flow-stripe-postback.component';

const routes: Routes = [
  {
    path: '',
    component: FlowStripePostbackComponent,
  },
];

@NgModule({
  declarations: [
    FlowStripePostbackComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    FlowStripePostbackComponent,
  ],
})
export class FlowStripePostbackModule {}
