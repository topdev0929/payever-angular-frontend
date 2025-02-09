import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebNumberInputModule, PebSlideToggleModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebOverflowForm } from './overflow-form.component';

@NgModule({
  declarations: [PebOverflowForm],
  imports: [
    CommonModule, 
    MatIconModule, 
    ReactiveFormsModule, 
    PebNumberInputModule, 
    PebSlideToggleModule,
    I18nModule,
  ],
  exports: [PebOverflowForm],
})
export class PebOverflowFormModule {}
