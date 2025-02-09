import { NgModule } from '@angular/core';
import { WindowModule } from '../../window';

import { ScrollHideDirective } from './directives';
import { BrowserDetectService } from './services';

/**
 * Module for browser specific adaptations
 */
@NgModule({
  declarations: [
    ScrollHideDirective
  ],
  imports: [
    WindowModule
  ],
  exports: [
    ScrollHideDirective
  ],
  providers: [
    BrowserDetectService
  ]
})
export class BrowserModule {}
