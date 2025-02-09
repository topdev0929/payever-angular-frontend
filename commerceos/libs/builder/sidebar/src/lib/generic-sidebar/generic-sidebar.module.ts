import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebColorPaletteModule } from '@pe/builder/form-controls';
import {
  PebBorderRadiusFormModule,
  PebDimensionsFormModule,
  PebFunctionFormModule,
  PebLinkFormModule,
  PebOpacityFormModule,
  PebPaddingFormModule,
  PebPositionFormModule,
  PebShadowFormModule,
  PebShapeBorderModule,
  PebTextFormModule,
} from '@pe/builder/forms';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebGenericSidebarComponent } from './generic-sidebar.component';


@NgModule({
  imports: [
    CommonModule,
    PebLinkFormModule,
    PebSidebarTabsModule,
    PebPositionFormModule,
    PebDimensionsFormModule,
    PebPaddingFormModule,
    PebTextFormModule,
    PebBorderRadiusFormModule,
    PebOpacityFormModule,
    PebShapeBorderModule,
    PebFunctionFormModule,
    PebShadowFormModule,
    MatIconModule,
    PebColorPaletteModule,
    ReactiveFormsModule,
    I18nModule,
  ],
  declarations: [
    PebGenericSidebarComponent,
  ],
  exports: [
    PebGenericSidebarComponent,
  ],
})
export class PebGenericSidebarModule {
}
