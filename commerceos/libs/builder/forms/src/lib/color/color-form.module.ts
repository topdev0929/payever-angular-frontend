import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebColorPickerModule, PebPebFillPresetModule } from '@pe/builder/form-controls';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { GradientFormModule } from '../gradient-form';

import { PebColorForm } from './color-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSidebarTabsModule,
    PebPebFillPresetModule,
    PebColorPickerModule,
    GradientFormModule,
    I18nModule,
  ],
  declarations: [
    PebColorForm,
  ],
  exports: [
    PebColorForm,
  ],
})
export class PebColorFormModule {
}
