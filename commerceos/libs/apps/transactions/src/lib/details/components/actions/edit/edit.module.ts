import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MicroModule } from '@pe/common';

import { SharedModule } from '../../../../shared';

import { EditActionStylesComponent } from './edit-styles/edit-styles.component';
import { ActionEditComponent } from './edit.component';

const routes: Routes = [{
  path: '',
  component: ActionEditComponent,
}];

@NgModule({
  declarations: [
    ActionEditComponent,
    EditActionStylesComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    MicroModule,
  ],
})
export class ActionEditModule { }
