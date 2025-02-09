import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormFieldInputModule, PebButtonModule, PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionChangeReferenceComponent } from './change-reference.component';


const routes: Routes = [{
  path: '',
  component: ActionChangeReferenceComponent,
}];

@NgModule({
  declarations: [
    ActionChangeReferenceComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionChangeReferenceModule { }
