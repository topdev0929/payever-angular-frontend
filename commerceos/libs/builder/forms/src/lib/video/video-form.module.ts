import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSlideToggleModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebVideoFormComponent } from './video-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSlideToggleModule,
    I18nModule,
  ],
  declarations: [
    PebVideoFormComponent,
  ],
  exports: [
    PebVideoFormComponent,
  ],
})
export class PebVideoFormModule {
}
