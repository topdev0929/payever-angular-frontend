import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatMenuModule } from '@angular/material/menu';
import { ColorPickerModule } from 'ngx-color-picker';

import { FormCoreModule } from '../../form-core/form-core.module';
import {
  ColorPanelComponent,
  ColorPickerComponent
} from './components';

const shared: any = [
  ColorPanelComponent,
  ColorPickerComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormCoreModule,
    ColorPickerModule
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
export class FormComponentsColorPickerModule {}
