import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClonePipe } from './clone.pipe';
import { MediaTypePipe } from './media-type.pipe';
import { StudioMediaUrlPipe } from './media-url.pipe';



@NgModule({
  declarations: [ClonePipe, MediaTypePipe, StudioMediaUrlPipe],
  imports: [
    CommonModule
  ],
  exports: [ClonePipe, MediaTypePipe, StudioMediaUrlPipe]
})
export class PipeModule { }
