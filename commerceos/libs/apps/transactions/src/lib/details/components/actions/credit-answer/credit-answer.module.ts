import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionCreditAnswerComponent } from './credit-answer.component';



const routes: Routes = [{
  path: '',
  component: ActionCreditAnswerComponent,
}];

@NgModule({
  declarations: [
    ActionCreditAnswerComponent,
  ],
  imports: [
    SharedModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionCreditAnswerModule { }
