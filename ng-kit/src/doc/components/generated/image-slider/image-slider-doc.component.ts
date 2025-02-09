import { Component } from '@angular/core';

@Component({
  selector: 'image-slider-doc',
  templateUrl: './image-slider-doc.component.html'
})
export class ImageSliderDocComponent {
  htmlExample: string =  require('raw-loader!./examples/image-slider-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/image-slider-example-basic.ts.txt');

  images: string[] = [
    'https://stage.payever.de/mediaservice/products/aa/03/f09a0178-7bc9-497d-a268-d809c3b711ce_customer_shop_grid.jpeg',
    'https://stage.payever.de/mediaservice/products/f4/8b/16457694-2a7e-4d0f-83f7-49bd57ce1de1_customer_shop_grid.jpeg',
    'https://stage.payever.de/mediaservice/products/a6/77/ae018ba8-dafb-4b44-8c15-81ef36350101_customer_shop_grid.jpeg',
    'https://stage.payever.de/mediaservice/products/8b/97/c94d50ae-075b-4785-a3e2-c113cf76c739_customer_shop_grid.jpeg',
    'https://stage.payever.de/mediaservice/products/65/37/65db7203-26c5-4364-ac6b-06d3530fa688_customer_shop_grid.jpeg'
  ];

  sliderConfig: SwiperOptions = {
    autoplay: {
      delay: 0,
      disableOnInteraction: false
    },
    navigation: {
      nextEl: '',
      prevEl: ''
    },
    spaceBetween: 0
  };

}
