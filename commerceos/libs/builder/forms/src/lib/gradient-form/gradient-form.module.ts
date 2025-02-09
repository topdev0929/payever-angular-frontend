import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebColorPickerModule, PebNumberInputModule, PebRangeInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebGradientFormComponent } from './gradient-form.component';



@NgModule({
  declarations: [PebGradientFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebColorPickerModule,
    PebNumberInputModule,
    PebRangeInputModule,
    I18nModule,
  ],
  exports: [PebGradientFormComponent],
})
export class GradientFormModule { }
