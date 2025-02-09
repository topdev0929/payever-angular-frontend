import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebOverlayCloseDirective } from './overlay-close.directive';
import { PebOverlayComponent } from './overlay.component';
import { PebOverlayTriggerDirective } from './overlay.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PebOverlayTriggerDirective,
    PebOverlayCloseDirective,
    PebOverlayComponent,
  ],
  exports: [
    PebOverlayTriggerDirective,
    PebOverlayCloseDirective,
  ],
})
export class PebOverlayModule {
}
