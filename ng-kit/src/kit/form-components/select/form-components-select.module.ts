import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { FormCoreModule } from '../../form-core/form-core.module';
import { SelectComponent } from './components';
import { DividerModule } from '../../divider/src';

const shared: any = [
  SelectComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    FormCoreModule,
    DividerModule
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
export class FormComponentsSelectModule {}
