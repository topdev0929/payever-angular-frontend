import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormFieldInputModule, PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';

import { ActionInvoiceComponent } from './invoice.component';

const routes: Routes = [{
  path: '',
  component: ActionInvoiceComponent,
}];

@NgModule({
  declarations: [
    ActionInvoiceComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionInvoiceModule { }
