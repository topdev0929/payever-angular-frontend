import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Routes, RouterModule } from '@angular/router';

import {
  PebFormFieldInputModule,
  PebButtonModule,
  PebFormBackgroundModule,
  PebButtonToggleModule,
  PebSelectModule,
} from '@pe/ui';

import { SharedModule } from '../../../../shared';
import { ProductPickerModule } from '../product-picker/product-picker.module';

import { ActionRefundTransactionComponent } from './refund.component';


const routes: Routes = [{
  path: '',
  component: ActionRefundTransactionComponent,
}];

@NgModule({
  declarations: [
    ActionRefundTransactionComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    PebButtonToggleModule,
    MatAutocompleteModule,
    PebSelectModule,
    ProductPickerModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionRefundModule { }
