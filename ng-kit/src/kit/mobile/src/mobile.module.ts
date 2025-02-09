import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevModule } from '../../dev';

import { PreventDoubleTapZoomDirective } from './directives';
import { PreventDoubleTapZoomCdkOverlay } from './components';

@NgModule({
  imports: [
    CommonModule,
    DevModule
  ],
  declarations: [
    PreventDoubleTapZoomDirective,
    PreventDoubleTapZoomCdkOverlay
  ],
  exports: [
    PreventDoubleTapZoomDirective,
    PreventDoubleTapZoomCdkOverlay
  ],
  entryComponents: [
    PreventDoubleTapZoomCdkOverlay
  ]
})
export class MobileModule {}
