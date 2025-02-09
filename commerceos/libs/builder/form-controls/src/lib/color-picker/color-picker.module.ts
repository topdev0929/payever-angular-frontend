import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';

import { PebNumberInputModule } from '../number-input';
import { PebRangeInputModule } from '../range-input';

import { PebHexComponent } from './hex.component';
import { PebHSVColorPickerComponent } from './hsva-picker.component';
import { PebPickerComponent } from './picker.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebNumberInputModule,
    PebRangeInputModule,
    I18nModule,
  ],
  declarations: [
    PebPickerComponent,
    PebHSVColorPickerComponent,
    PebHexComponent,
  ],
  exports: [
    PebPickerComponent,
  ],
})
export class PebColorPickerModule {
}
