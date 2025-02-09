import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from './carousel.component';
import { CarouselService } from './carousel.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CarouselComponent
  ],
  providers: [ CarouselService ],
  entryComponents: [ CarouselComponent ],
  exports: [ CarouselComponent ]
})
export class CarouselModule {}
