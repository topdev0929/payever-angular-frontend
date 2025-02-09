# Angular 2 component with image slider

It uses js library [Swiper](http://idangero.us/swiper/get-started)

It supports pagination, next/prev buttons, thumbnails, etc.

## How to use
1) Import ImageSliderModule into your module

``` import { ImageSliderModule } from '@pe/ng-kit/modules/image-slider'; ```

2) add `ui-image-slider` component into your template

```
<pe-image-slider
  [images]="images" 
  [showThumbs]="false" 
  [usePagination]="true" 
  [height]="'300px'" 
  [width]="'100%'" 
  [fitToHeight]="false"
  [fitToWidth]="true" >
</pe-image-slider>
```


## Configuration 
Image slider component has following properties

1) `images` - array of urls with images
2) `options` - object with swiper configs. You can look at Swiper's API [here](http://idangero.us/swiper/api/)
3) `height` - _(default: '380px')_ string. Height of slider.
4) `width` - _(default: '100%')_ string. Width of slider
5) `showThumbs` - _(default: false)_ boolean. Show/hide thumbails below the slider
6) `usePagination` - _(default: false)_ boolean. Show/hide bullets below the slider
7) `fitToWidth` - _(default: true)_ boolean. Set width of images equals to 100% and cut top and bottom parts of image
8) `fitToHeight` - _(default: true)_ boolean. Set height of image equals to 100%. In this case slider may have empty spaces to the right and to the left of image
9) `showPrevNext` - _(default: true)_ boolean. Show navigation arrows
