import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { FormCoreModule } from '../../form-core/form-core.module';
import { ButtonToggleGroupComponent } from './components';

const shared: any = [
  ButtonToggleGroupComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
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
export class FormComponentsButtonToggleModule {}
