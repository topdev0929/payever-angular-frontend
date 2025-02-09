import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebSizeInputModule, PebSlideToggleModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebAutoResizeFormModule } from '../auto-resize';
import { PebOverflowFormModule } from '../overflow';

import { PebDimensionsForm } from './dimensions-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSlideToggleModule,
    PebSizeInputModule,
    PebOverflowFormModule,
    PebAutoResizeFormModule,
    I18nModule,
  ],
  declarations: [
    PebDimensionsForm,
  ],
  exports: [
    PebDimensionsForm,
  ],
})
export class PebDimensionsFormModule {
}
