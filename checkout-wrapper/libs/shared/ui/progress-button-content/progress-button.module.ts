import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProgressButtonContentComponent } from './progress-button-content.component';

@NgModule({
  declarations: [
    ProgressButtonContentComponent,
  ],
  imports: [
    CommonModule,

    MatProgressSpinnerModule,
  ],
  exports: [
    ProgressButtonContentComponent,
  ],
})
export class ProgressButtonContentModule {}
