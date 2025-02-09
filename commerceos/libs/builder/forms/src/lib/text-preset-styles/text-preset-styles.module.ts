import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebSelectInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebTextPresetStylesFormComponent } from './text-preset-styles-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, PebSelectInputModule, I18nModule, MatIconModule],
  declarations: [PebTextPresetStylesFormComponent],
  exports: [PebTextPresetStylesFormComponent],
})
export class PebTextPresetStylesFormModule {}
