import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeedbackComponent } from './feedback.component';

@NgModule({
  imports: [CommonModule],
  declarations: [FeedbackComponent],
  entryComponents: [ FeedbackComponent ],
  exports: [ FeedbackComponent ]
})
export class FeedbackModule {}
