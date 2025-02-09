import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { WindowModule } from '../window/src';
import { BrowserModule } from '../browser/src';
import { FormCoreModule } from '../form-core/form-core.module';

import {
  FormRowComponent,
  FormRowAddonComponent,
  FormRowDefaultComponent,
  FormRowTableComponent
} from './components';

const shared: any = [
  FormRowComponent,
  FormRowAddonComponent,
  FormRowDefaultComponent,
  FormRowTableComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WindowModule,
    BrowserModule,
    FormCoreModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared,
    ReactiveFormsModule,
  ]
})
export class FormDeprecatedModule {}
