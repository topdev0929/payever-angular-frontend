import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormFieldInputModule, PebButtonModule, PebFormBackgroundModule } from '@pe/ui';



import { SharedModule } from '../../../../shared';

import { ActionAuthorizeComponent } from './authorize.component';


const routes: Routes = [{
  path: '',
  component: ActionAuthorizeComponent,
}];

@NgModule({
  declarations: [
    ActionAuthorizeComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionAuthorizeModule { }
