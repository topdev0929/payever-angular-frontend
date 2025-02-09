import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

import { FormCoreModule } from '../../form-core/form-core.module';
import { RadioGroupComponent } from './components';

const shared: any = [
  RadioGroupComponent
];

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatRadioModule,
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
export class FormComponentsRadioModule {}
