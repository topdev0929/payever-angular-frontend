import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';

import { FormCoreModule } from '../../form-core/form-core.module';
import { CheckboxComponent } from './components';

const shared: any = [
  CheckboxComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
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
export class FormComponentsCheckboxModule {}
