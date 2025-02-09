import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TextMaskModule } from 'angular2-text-mask';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormCoreModule } from '../../form-core/form-core.module';
import { InputCreditCardNumberComponent } from './components';

const shared: any = [
  InputCreditCardNumberComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextMaskModule,
    MatInputModule,
    MatFormFieldModule,
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
export class FormComponentsInputCreditCardNumberModule {}
