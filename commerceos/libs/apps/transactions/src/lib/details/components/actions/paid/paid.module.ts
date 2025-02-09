import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionPaidComponent } from './paid.component';


const routes: Routes = [{
  path: '',
  component: ActionPaidComponent,
}];

@NgModule({
  declarations: [
    ActionPaidComponent,
  ],
  imports: [
    SharedModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionPaidModule { }
