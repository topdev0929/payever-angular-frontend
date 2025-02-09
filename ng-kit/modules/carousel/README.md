# Import module
```typescript
import { CarouselModule } from '@pe/ng-kit/modules/carousel';
```

### ngx-boostratp/carousel is utilized, please also include
```typescript
import { CarouselModule } from 'ngx-bootstrap/carousel';

@NgModule({
  imports: [
    CarouselModule.forRoot()
    ...
  ]
});
```

## Carouselcomponent
Selector:
- pe-carousel

Params:
- none

### Usage
Has transclution placeholder

````html
<pe-carousel>
  <carousel [interval]="false">
    <slide>
      <img src="../../../assets/img/product-image.png" alt="First slide">
    </slide>
    <slide>
      <img src="../../../assets/img/product-image-2.png" alt="Second slide">
    </slide>
    <slide>
      <img src="../../../assets/img/product-image-3.png" alt="Third slide">
    </slide>
    <slide>
      <img src="../../../assets/img/product-image-4.png" alt="Forth slide">
    </slide>
  </carousel>
</pe-carousel>
````
### CarouselService
import { CarouselService } from '@pe/ng-kit/modules/carousel';

Methods:
- closeCarousel()
- openCarousel()

you can subscribe to open and close events
- carouselService.carouselClosed$.subscribe(() => { console.log('closed'); });
- carouselService.carouselOpened$.subscribe(() => { console.log('opened'); });
