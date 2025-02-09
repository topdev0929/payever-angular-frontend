import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideViewerComponent } from './guide-viewer/guide-viewer.component';
import { DocViewerModule } from '../doc-viewer';
import { GuideItems} from '../../shared/guide-items';

@NgModule({
  imports: [
    CommonModule,
    DocViewerModule
  ],
  declarations: [
    GuideViewerComponent
  ],
  exports: [
    GuideViewerComponent
  ],
  providers: [GuideItems]
})
export class GuideViewerModule {}
