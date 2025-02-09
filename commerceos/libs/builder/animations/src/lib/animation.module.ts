import { NgModule } from '@angular/core';

import { PebAnimationDirective, PebEditorAnimationDirective } from './directives';
import { PebAnimationService } from './services';

@NgModule({
  providers: [
    PebAnimationService,
  ],
  declarations: [
    PebAnimationDirective,
    PebEditorAnimationDirective,
  ],
  exports: [
    PebAnimationDirective,
    PebEditorAnimationDirective,
  ],
})
export class PebAnimationModule {
}
