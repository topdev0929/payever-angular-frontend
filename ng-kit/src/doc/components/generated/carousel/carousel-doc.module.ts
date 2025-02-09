import { NgModule } from '@angular/core';
import { CarouselDocComponent } from './carousel-doc.component';
import { CarouselServiceDocComponent } from './carousel-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { CarouselModule as PeCarouselModule } from '../../../../kit/carousel/src';
import { CarouselModule } from 'ngx-bootstrap/carousel';

@NgModule({
  imports: [
    DocComponentSharedModule,
    PeCarouselModule,
    CarouselModule
  ],
  declarations: [
    CarouselDocComponent,
    CarouselServiceDocComponent
  ]
})
export class CarouselDocModule {

}
