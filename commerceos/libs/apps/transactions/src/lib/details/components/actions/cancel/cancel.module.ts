import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebSelectModule, PebFormFieldInputModule, PebButtonModule, PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionCancelTransactionComponent } from './cancel.component';

const routes: Routes = [{
  path: '',
  component: ActionCancelTransactionComponent,
}];

@NgModule({
  declarations: [
    ActionCancelTransactionComponent,
  ],
  imports: [
    SharedModule,
    PebSelectModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionCancelModule { }
