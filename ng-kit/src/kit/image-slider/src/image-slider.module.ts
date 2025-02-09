import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaModule } from '../../media';
import { ImageSliderComponent } from './image-slider.component';

@NgModule({
  imports: [
    CommonModule,
    MediaModule
  ],
  declarations: [ ImageSliderComponent ],
  exports: [ ImageSliderComponent ]
})
export class ImageSliderModule {
}
