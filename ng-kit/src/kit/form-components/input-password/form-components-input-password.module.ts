import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { I18nModule } from '../../i18n';

import { FormCoreModule } from '../../form-core/form-core.module';
import { InputPasswordComponent } from './components';
import { InputPasswordValidator } from './validators';

const shared: any = [
  InputPasswordComponent,
  InputPasswordValidator
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    I18nModule,
    FormCoreModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    InputPasswordComponent
  ],
  exports: [
    ...shared
  ]
})
export class FormComponentsInputPasswordModule {}
