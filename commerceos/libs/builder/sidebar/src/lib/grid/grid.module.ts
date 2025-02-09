import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebNumberInputModule, PebSlideToggleModule } from '@pe/builder/form-controls';
import {
  PebAlignmentFormModule, PebDimensionsFormModule,
  PebFunctionFormModule,
  PebGridBorderFormModule,
  PebGridLayoutFormModule,
  PebLinkFormModule,
  PebPositionFormModule,
  PebTextFormModule,
} from '@pe/builder/forms';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebEditorGridSidebarComponent } from './grid.sidebar';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebGridLayoutFormModule,
    PebNumberInputModule,
    PebLinkFormModule,
    PebTextFormModule,
    PebPositionFormModule,
    PebAlignmentFormModule,
    PebGridBorderFormModule,
    PebSidebarTabsModule,
    PebSlideToggleModule,
    PebFunctionFormModule,
    PebDimensionsFormModule,
    I18nModule,
  ],
  declarations: [
    PebEditorGridSidebarComponent,
  ],
  exports: [
    PebEditorGridSidebarComponent,
  ],
})
export class PebEditorGridPluginModule {
}
