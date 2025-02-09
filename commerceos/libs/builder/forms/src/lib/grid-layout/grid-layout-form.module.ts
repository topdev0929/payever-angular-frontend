import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebNumberInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebGridLayoutFormComponent } from './grid-layout-form.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebNumberInputModule,
    I18nModule,
  ],
  declarations: [
    PebGridLayoutFormComponent,
  ],
  exports: [
    PebGridLayoutFormComponent,
  ],
})
export class PebGridLayoutFormModule {
}
