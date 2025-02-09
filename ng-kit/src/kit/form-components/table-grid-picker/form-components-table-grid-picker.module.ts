import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatGridListModule } from '@angular/material/grid-list';

import { FormCoreModule } from '../../form-core/form-core.module';
import { TableGridPickerComponent } from './components';

const shared: any = [
  TableGridPickerComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatGridListModule,
    FormCoreModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared
  ]
})
export class FormComponentsTableGridPickerModule {}
