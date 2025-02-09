import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebSlideToggleModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebLayoutIndexFormComponent } from './layout-index-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebAutoHideScrollbarModule,
    PebSlideToggleModule,
    I18nModule,
  ],
  declarations: [PebLayoutIndexFormComponent],
  exports: [PebLayoutIndexFormComponent],
})
export class PebLayoutIndexFormModule {}
