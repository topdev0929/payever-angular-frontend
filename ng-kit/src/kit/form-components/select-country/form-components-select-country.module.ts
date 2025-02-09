import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { FormCoreModule } from '../../form-core/form-core.module';
import { SelectCountryComponent } from './components';

const shared: any = [
  SelectCountryComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
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
export class FormComponentsSelectCountryModule {}
