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
  PebBackgroundFormModule,
  PebBorderRadiusFormModule,
  PebDimensionsFormModule,
  PebFunctionFormModule,
  PebLinkFormModule,
  PebPositionFormModule,
  PebShadowFormModule,
  PebShapeBorderModule,
  PebOpacityFormModule,
  PebStudioMediaFormModule,
  PebTextFormModule,
  PebVideoFormModule,
  PebBlurFormModule,
  PebBackdropFilterFormModule,
  PebLayoutIndexFormModule,
  PebLayoutFormModule,
} from '@pe/builder/forms';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebEditorVectorSidebarComponent } from './vector.sidebar';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    PebAlignmentFormModule,
    PebBackgroundFormModule,
    PebDimensionsFormModule,
    PebPositionFormModule,
    PebStudioMediaFormModule,
    PebBorderRadiusFormModule,
    PebOpacityFormModule,
    PebLinkFormModule,
    PebTextFormModule,
    PebNumberInputModule,
    PebAnglePickerModule,
    PebRangeInputModule,
    PebShapeBorderModule,
    PebColorPaletteModule,
    PebSidebarTabsModule,
    PebSlideToggleModule,
    PebFunctionFormModule,
    PebShadowFormModule,
    PebBlurFormModule,
    PebBackdropFilterFormModule,
    PebVideoFormModule,
    PebLayoutFormModule,
    PebLayoutIndexFormModule,
    I18nModule,
  ],
  declarations: [
    PebEditorVectorSidebarComponent,
  ],
  exports: [
    PebEditorVectorSidebarComponent,
  ],
})
export class PebEditorVectorPluginModule {
}
