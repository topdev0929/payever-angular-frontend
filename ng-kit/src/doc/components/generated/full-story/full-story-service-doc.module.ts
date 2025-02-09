import { NgModule } from '@angular/core';
import { FullStoryServiceDocComponent } from './full-story-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FullStoryModule } from '../../../../kit/full-story';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FullStoryModule
  ],
  declarations: [FullStoryServiceDocComponent]
})
export class FullStoryServiceDocModule {
}
