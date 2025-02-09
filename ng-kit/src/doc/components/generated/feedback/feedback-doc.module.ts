import { NgModule } from '@angular/core';
import { FeedbackDocComponent } from './feedback-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FeedbackModule } from '../../../../kit/feedback';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FeedbackModule
  ],
  declarations: [FeedbackDocComponent]
})
export class FeedbackDocModule {
}
