import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebButtonToggleModule, PebNumberInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebGridBorderForm } from './grid-border.form';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PebNumberInputModule,
    PebButtonToggleModule,
    I18nModule,
  ],
  declarations: [
    PebGridBorderForm,
  ],
  exports: [
    PebGridBorderForm,
  ],
})
export class PebGridBorderFormModule {
}
