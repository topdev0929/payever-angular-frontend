import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSelectInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';
import { PebButtonModule, PebCheckboxModule } from '@pe/ui';

import { PebLanguagesFormComponent } from './languages-form.component';
import { LanguagesListComponent } from './languages-list/languages-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSelectInputModule,
    PebButtonModule,
    PebCheckboxModule,
    I18nModule,
  ],
  declarations: [
    PebLanguagesFormComponent,
    LanguagesListComponent,
  ],
  exports: [
    PebLanguagesFormComponent,
    LanguagesListComponent,
  ],
})
export class PebLanguagesFormModule {
}
