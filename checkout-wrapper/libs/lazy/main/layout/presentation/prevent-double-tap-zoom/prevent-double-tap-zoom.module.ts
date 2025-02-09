import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PreventDoubleTapZoomCdkOverlayComponent } from './components';
import { PreventDoubleTapZoomDirective } from './directives';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PreventDoubleTapZoomDirective,
    PreventDoubleTapZoomCdkOverlayComponent,
  ],
  exports: [
    PreventDoubleTapZoomDirective,
    PreventDoubleTapZoomCdkOverlayComponent,
  ],
})
export class PreventDoubleTapZoomModule {}
