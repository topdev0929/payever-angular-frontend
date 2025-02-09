import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Routes, RouterModule } from '@angular/router';

import { PebFormFieldInputModule, PebButtonModule, PebFormBackgroundModule, PebSelectModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionChangeDeliveryComponent } from './change-delivery.component';

const routes: Routes = [{
  path: '',
  component: ActionChangeDeliveryComponent,
}];

@NgModule({
  declarations: [
    ActionChangeDeliveryComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebSelectModule,
    PebFormBackgroundModule,
    MatIconModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionChangeDeliveryModule { }
