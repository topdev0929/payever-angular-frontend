import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionVoidComponent } from './void.component';

const routes: Routes = [{
  path: '',
  component: ActionVoidComponent,
}];

@NgModule({
  declarations: [
    ActionVoidComponent,
  ],
  imports: [
    SharedModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionVoidModule { }
