import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebDirectivesModule } from '@pe/builder/directives';

import { PebThreeJsModelFillComponent } from './three-js-model-fill.component';

@NgModule({
  imports: [CommonModule, PebDirectivesModule],
  declarations: [PebThreeJsModelFillComponent],
  exports: [PebThreeJsModelFillComponent],
})
export class PebThreeJsModelFillModule {}
