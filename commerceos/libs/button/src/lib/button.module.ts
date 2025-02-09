import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProgressButtonContentStylesComponent } from './progress-button-content/progress-button-content-styles.component';
import { ProgressButtonContentComponent } from './progress-button-content/progress-button-content.component';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule],
  declarations: [ProgressButtonContentComponent, ProgressButtonContentStylesComponent],
  entryComponents: [ProgressButtonContentComponent],
  exports: [ProgressButtonContentComponent],
})
export class ButtonModule {}
