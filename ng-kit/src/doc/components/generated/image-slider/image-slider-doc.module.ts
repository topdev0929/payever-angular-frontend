import { NgModule } from '@angular/core';
import { ImageSliderDocComponent } from './image-slider-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ImageSliderModule } from '../../../../kit/image-slider/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ImageSliderModule
  ],
  declarations: [ImageSliderDocComponent]
})
export class ImageSliderDocModule {
}
