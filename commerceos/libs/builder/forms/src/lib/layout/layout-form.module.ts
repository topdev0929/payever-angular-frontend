import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebSelectInputModule, PebSizeInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebLayoutFormComponent } from './layout-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, PebSizeInputModule, PebSelectInputModule, I18nModule],
  declarations: [PebLayoutFormComponent],
  exports: [PebLayoutFormComponent],
})
export class PebLayoutFormModule {}
