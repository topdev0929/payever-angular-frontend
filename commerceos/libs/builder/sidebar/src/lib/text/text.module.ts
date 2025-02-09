import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import {
  PebAnglePickerModule,
  PebColorPaletteModule,
  PebNumberInputModule,
  PebRangeInputModule,
  PebSlideToggleModule,
} from '@pe/builder/form-controls';
import {
  PebAlignmentFormModule,
  PebBackdropFilterFormModule,
  PebBackgroundFormModule,
  PebBlurFormModule,
  PebBorderRadiusFormModule,
  PebDimensionsFormModule,
  PebFunctionFormModule,
  PebLayoutIndexFormModule,
  PebLinkFormModule,
  PebOpacityFormModule,
  PebPaddingFormModule,
  PebPositionFormModule,
  PebShadowFormModule,
  PebShapeBorderModule,
  PebStudioMediaFormModule,
  PebTextFormModule,
  PebTextPresetStylesFormModule,
} from '@pe/builder/forms';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { PebEditorSharedModule } from '@pe/builder/shared';
import { I18nModule } from '@pe/i18n';

import { PebEditorTextSidebarComponent } from './text.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebEditorSharedModule,
    MatIconModule,
    PebPositionFormModule,
    PebDimensionsFormModule,
    PebPaddingFormModule,
    PebAlignmentFormModule,
    PebFunctionFormModule,
    PebTextFormModule,
    PebTextPresetStylesFormModule,
    PebLinkFormModule,
    PebColorPaletteModule,
    PebSidebarTabsModule,
    PebLayoutIndexFormModule,
    I18nModule,

    PebBackgroundFormModule,
    PebStudioMediaFormModule,
    PebBorderRadiusFormModule,
    PebOpacityFormModule,
    PebNumberInputModule,
    PebAnglePickerModule,
    PebRangeInputModule,
    PebShapeBorderModule,
    PebSlideToggleModule,
    PebShadowFormModule,
    PebBlurFormModule,
    PebBackdropFilterFormModule,
  ],
  declarations: [
    PebEditorTextSidebarComponent,
  ],
  exports: [
    PebEditorTextSidebarComponent,
  ],
})
export class PebEditorTextPluginModule {
}
