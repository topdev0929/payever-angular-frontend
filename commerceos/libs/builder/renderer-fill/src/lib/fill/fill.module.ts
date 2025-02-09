import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebIframeFillModule } from '../iframe-fill';
import { PebScriptFillModule } from '../script-fill';
import { PebSvgFillModule } from '../svg-fill';
import { PebThreeJsModelFillModule } from '../three-js-fill';
import { PebVideoFillModule } from '../video-fill';

import { PebFillComponent } from './fill.component';

@NgModule({
  imports: [
    CommonModule,
    PebScriptFillModule,
    PebThreeJsModelFillModule,
    PebVideoFillModule,
    PebSvgFillModule,
    PebIframeFillModule,
  ],
  declarations: [PebFillComponent],
  exports: [PebFillComponent],
})
export class PebFillModule {}
