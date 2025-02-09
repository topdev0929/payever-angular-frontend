import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DocViewerComponent
  ],
  exports: [
    DocViewerComponent
  ]
})
export class DocViewerModule {}
