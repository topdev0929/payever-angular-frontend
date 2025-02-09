import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSelectInputModule, PebSlideToggleModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebPageFormComponent } from './page-form.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSlideToggleModule,
    PebSelectInputModule,
    I18nModule,
  ],
  declarations: [
    PebPageFormComponent,
  ],
  exports: [
    PebPageFormComponent,
  ],
})
export class PebPageFormModule {
}
