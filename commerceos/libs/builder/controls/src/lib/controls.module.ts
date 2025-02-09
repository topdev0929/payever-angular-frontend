import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';

import { PebElementBorderRadiusControl } from './element-border-radius';
import { PebControlsService, PebSectionComponent, PebSelectionComponent } from './selection';
import { PebControlsComponent } from './selection/controls.component';
import { PebSnapLinesComponent } from './selection/snap-lines.component';

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
  ],
  declarations: [
    PebSectionComponent,
    PebSelectionComponent,
    PebControlsComponent,
    PebSnapLinesComponent,
    PebElementBorderRadiusControl,
  ],
  exports: [
    PebSectionComponent,
    PebSelectionComponent,
    PebControlsComponent,
    PebSnapLinesComponent,
  ],
  providers: [
    PebControlsService,
  ],
})
export class PebControlsModule {
}
