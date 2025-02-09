import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressButtonContentComponent } from './progress-button-content/progress-button-content.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    ProgressButtonContentComponent
  ],
  entryComponents: [
    ProgressButtonContentComponent
  ],
  exports: [
    ProgressButtonContentComponent
  ]
})
export class ButtonModule {}
