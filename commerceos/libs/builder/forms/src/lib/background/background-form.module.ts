import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import {
  PebColorPickerModule,
  PebNumberInputModule,
  PebPebFillPresetModule,
  PebRangeInputModule,
  PebSelectInputModule,
  PebSizeInputModule,
  PebSlideToggleModule,
} from '@pe/builder/form-controls';
import { PebEditorIconsModule, PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { GradientFormModule } from '../gradient-form';

import { PebBackgroundForm } from './background-form.component';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    PebSidebarTabsModule,
    PebPebFillPresetModule,
    GradientFormModule,
    PebColorPickerModule,
    PebNumberInputModule,
    PebRangeInputModule,
    PebSelectInputModule,
    PebEditorIconsModule,
    PebSlideToggleModule,
    PebSizeInputModule,
    I18nModule,
  ],
  declarations: [
    PebBackgroundForm,
  ],
  exports: [
    PebBackgroundForm,
  ],
})
export class PebBackgroundFormModule {
}
