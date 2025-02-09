import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import {
  PebBackdropFilterFormModule,
  PebBlurFormModule,
  PebContentAlignFormModule,
  PebFunctionFormModule,
  PebLayoutFormModule,
  PebPaddingFormModule,
  PebPositionFormModule,
  PebSectionFormModule,
  PebShadowFormModule,
  PebStudioMediaFormModule,
  PebVideoFormModule,
} from '@pe/builder/forms';
import { PebSidebarTabsModule } from '@pe/builder/old';
import { I18nModule } from '@pe/i18n';

import { PebEditorSectionSidebarComponent } from './section.sidebar';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    PebStudioMediaFormModule,
    PebSectionFormModule,
    PebPaddingFormModule,
    PebContentAlignFormModule,
    PebSidebarTabsModule,
    PebVideoFormModule,
    PebFunctionFormModule,
    PebBlurFormModule,
    PebBackdropFilterFormModule,
    PebShadowFormModule,
    PebPositionFormModule,
    PebLayoutFormModule,
    I18nModule,
  ],
  declarations: [
    PebEditorSectionSidebarComponent,
  ],
  exports: [
    PebEditorSectionSidebarComponent,
  ],
})
export class PebEditorSectionPluginModule {
}
