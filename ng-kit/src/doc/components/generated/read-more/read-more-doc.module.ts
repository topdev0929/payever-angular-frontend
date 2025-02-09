import { NgModule } from '@angular/core';
import { ReadMoreDirectiveDocComponent } from './read-more-directive-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ReadMoreModule } from '../../../../kit/read-more';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ReadMoreModule
  ],
  declarations: [ReadMoreDirectiveDocComponent]
})
export class ReadMoreDocModule {
}
