import { NgModule } from '@angular/core';
import { WindowModule } from '../../window';

import { BackgroundSizeCalcDirective } from './directives';

/**
 * Module for blurry-backgrounds specific adaptations
 */
@NgModule({
  declarations: [
    BackgroundSizeCalcDirective
  ],
  imports: [
    WindowModule
  ],
  exports: [
    BackgroundSizeCalcDirective
  ],
})
export class BlurryModule {}
