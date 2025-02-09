import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSlideToggleModule, PebTextareaModule, PebTextInputModule } from '@pe/builder/form-controls';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebSeoForm } from './seo-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSlideToggleModule,
    PebSidebarTabsModule,
    PebTextInputModule,
    PebTextareaModule,
    I18nModule,
  ],
  declarations: [
    PebSeoForm,
  ],
  exports: [
    PebSeoForm,
  ],
})
export class PebSeoFormModule {
}
