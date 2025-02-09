import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSlideToggleModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebRestrictAccessFormComponent } from './restrict-access-form.component';
import { PebRestrictAccessForm } from './restrict-access.form';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSlideToggleModule,
    I18nModule,
  ],
  declarations: [
    PebRestrictAccessForm,
    PebRestrictAccessFormComponent,
  ],
  exports: [
    PebRestrictAccessFormComponent,
  ],
})
export class PebRestrictAccessFormModule {
}
