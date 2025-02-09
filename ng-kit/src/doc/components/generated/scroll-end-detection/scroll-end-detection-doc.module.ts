import { NgModule } from '@angular/core';
import { ScrollEndDetectionDirectiveDocComponent } from './scroll-end-detection-directive-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ScrollEndDetectionModule } from '../../../../kit/scroll-end-detection';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ScrollEndDetectionModule
  ],
  declarations: [ScrollEndDetectionDirectiveDocComponent]
})
export class ScrollEndDetectionDocModule {
}
