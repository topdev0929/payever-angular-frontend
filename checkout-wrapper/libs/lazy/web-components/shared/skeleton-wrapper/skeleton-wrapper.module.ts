import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SkeletonDefaultTemplateComponent } from './skeleton-default-template.component';

@NgModule({
  declarations: [
    SkeletonDefaultTemplateComponent,
  ],
  imports: [CommonModule],
  exports: [
    SkeletonDefaultTemplateComponent,
  ],
})
export class SkeletonWrapperModule {}
