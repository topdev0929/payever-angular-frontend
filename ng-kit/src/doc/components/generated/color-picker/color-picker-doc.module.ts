import { NgModule } from '@angular/core';

import { FormComponentsColorPickerModule } from '../../../../kit/form-components/color-picker';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ColorPickerDocComponent } from './color-picker-doc.component';
import { ColorPickerDefaultExampleDocComponent } from './examples';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsColorPickerModule
  ],
  declarations: [
    ColorPickerDocComponent,
    ColorPickerDefaultExampleDocComponent
  ]
})
export class ColorPickerDocModule {
}
