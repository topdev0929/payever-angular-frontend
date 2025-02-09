import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { BrowserModule } from '../../browser';
import { FileDropModule } from '../../file-drop';
import { FormCoreModule } from '../../form-core/form-core.module';
import { FilePickerComponent } from './components';

const shared: any = [
  FilePickerComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormCoreModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    BrowserModule,
    FileDropModule
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
export class FormComponentsFilePickerModule {}
