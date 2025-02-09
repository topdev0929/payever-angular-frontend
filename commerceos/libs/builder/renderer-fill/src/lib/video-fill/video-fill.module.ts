import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebVideoFillComponent } from './video-fill.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PebVideoFillComponent],
  exports: [PebVideoFillComponent],
})
export class PebVideoFillModule {}
