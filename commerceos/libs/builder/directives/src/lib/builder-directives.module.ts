import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebHtmlDirective } from './html.directive';
import { PebLinkDirective } from './link.directive';
import { PebRenderDirective } from './renderer.directive';
import { PebStyleDirective } from './style.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PebRenderDirective,
    PebHtmlDirective,
    PebStyleDirective,
    PebLinkDirective,
  ],
  exports: [
    PebRenderDirective,
    PebHtmlDirective,
    PebStyleDirective,
    PebLinkDirective,
  ],
})
export class PebDirectivesModule {
}
