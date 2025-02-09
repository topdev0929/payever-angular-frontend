import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormFieldInputModule, PebButtonModule, PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionChangeAmountComponent } from './change-amount.component';


const routes: Routes = [{
  path: '',
  component: ActionChangeAmountComponent,
}];

@NgModule({
  declarations: [
    ActionChangeAmountComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionChangeAmountModule { }
