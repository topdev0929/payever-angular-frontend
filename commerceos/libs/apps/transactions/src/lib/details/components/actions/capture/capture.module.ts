import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PebFormFieldInputModule, PebButtonModule, PebFormBackgroundModule } from '@pe/ui';

import { SharedModule } from '../../../../shared';
import { ProductPickerModule } from '../product-picker/product-picker.module';

import { ActionCaptureComponent } from './capture.component';


const routes: Routes = [{
  path: '',
  component: ActionCaptureComponent,
}];

@NgModule({
  declarations: [
    ActionCaptureComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    ProductPickerModule,
    PebFormBackgroundModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionCaptureModule { }
