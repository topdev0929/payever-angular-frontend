import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebNumberInputModule, PebRangeInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebBorderRadiusForm } from './border-radius-form.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebRangeInputModule,
    PebNumberInputModule,
    I18nModule,
  ],
  declarations: [
    PebBorderRadiusForm,
  ],
  exports: [
    PebBorderRadiusForm,
  ],
})
export class PebBorderRadiusFormModule {
}
