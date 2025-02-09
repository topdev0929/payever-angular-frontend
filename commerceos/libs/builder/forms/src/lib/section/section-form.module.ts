import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  PebNumberInputModule,
  PebSizeInputModule,
  PebSlideToggleModule,
  PebTextInputModule,
} from '@pe/builder/form-controls';
import { PebEditorIconsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebAutoResizeFormModule } from '../auto-resize';
import { PebLayoutFormModule } from '../layout';
import { PebOverflowFormModule } from '../overflow';

import { PebSectionFormComponent } from './section-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebSlideToggleModule,
    PebNumberInputModule,
    PebEditorIconsModule,
    PebTextInputModule,
    PebOverflowFormModule,
    PebAutoResizeFormModule,
    PebLayoutFormModule,
    PebSizeInputModule,
    I18nModule,
  ],
  declarations: [
    PebSectionFormComponent,
  ],
  exports: [
    PebSectionFormComponent,
  ],
})
export class PebSectionFormModule {
}
