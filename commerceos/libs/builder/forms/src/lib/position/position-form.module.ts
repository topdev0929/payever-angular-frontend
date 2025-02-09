import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSelectInputModule, PebSizeInputModule } from '@pe/builder/form-controls';
import { PebEditorIconsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebPositionForm } from './position-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSelectInputModule,
    PebSizeInputModule,
    I18nModule,
    PebEditorIconsModule,
  ],
  declarations: [
    PebPositionForm,
  ],
  exports: [
    PebPositionForm,
  ],
})
export class PebPositionFormModule {
}
