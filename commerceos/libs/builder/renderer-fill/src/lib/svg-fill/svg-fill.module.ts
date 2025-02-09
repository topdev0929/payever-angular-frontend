import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebDirectivesModule } from '@pe/builder/directives';

import { PebSvgFillComponent } from './svg-fill.component';

@NgModule({
  imports: [CommonModule, PebDirectivesModule],
  declarations: [PebSvgFillComponent],
  exports: [PebSvgFillComponent],
})
export class PebSvgFillModule {}
