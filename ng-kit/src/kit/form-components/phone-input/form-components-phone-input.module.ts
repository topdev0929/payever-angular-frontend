import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormCoreModule } from '../../form-core/form-core.module';
import { PhoneInputComponent, PhoneInputFilterDirective } from './components';

const shared: any = [
  PhoneInputComponent,
  PhoneInputFilterDirective
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    FormCoreModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    PhoneInputComponent
  ],
  exports: [
    ...shared
  ]
})
export class FormComponentsPhoneInputModule {}
