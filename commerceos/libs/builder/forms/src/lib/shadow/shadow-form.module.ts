import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import {
  PebAnglePickerModule,
  PebNumberInputModule,
  PebRangeInputModule,
  PebSlideToggleModule,
} from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebShadowForm } from './shadow-form.component';

@NgModule({
	declarations: [
    PebShadowForm,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    PebAnglePickerModule,
    PebNumberInputModule,
    PebRangeInputModule,
    PebSlideToggleModule,
    I18nModule,
  ],
  exports: [
    PebShadowForm,
  ],
})
export class PebShadowFormModule {
}
