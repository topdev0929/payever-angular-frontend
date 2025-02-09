import { Component } from '@angular/core';
import { CarouselService } from '../../../../../modules/carousel';

@Component({
  selector: 'doc-carousel',
  templateUrl: 'carousel-doc.component.html'
})
export class CarouselDocComponent {
  htmlExample: string =  require('raw-loader!./examples/carousel-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/carousel-example-basic.ts.txt');

  carouselImage: string[] = [
    require('../../../assets/img/product-image.png'),
    require('../../../assets/img/product-image-2.png'),
    require('../../../assets/img/product-image-3.png'),
    require('../../../assets/img/product-image-4.png'),
  ];

  constructor(private carouselService: CarouselService){}

  showCarousel() {
    this.carouselService.openCarousel();
  }
}
