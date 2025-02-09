import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebNumberInputModule, PebRangeInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebOpacityFormComponent } from './opacity-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebRangeInputModule,
    PebNumberInputModule,
    I18nModule,
  ],
  declarations: [
    PebOpacityFormComponent,
  ],
  exports: [
    PebOpacityFormComponent,
  ],
})
export class PebOpacityFormModule {
}
