import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { isEqual } from 'lodash-es';

import { MediaContainerType } from '../../media';
import { defaultImageSliderOptions, defaultThumbsOptions } from './config/default-image-slider-config';

@Component({
  selector: 'pe-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSliderComponent implements OnInit {

  initialImage: string;
  images: string[];

  @Input('initialImage') set setInitialImage(initialImage: string) {
    if (this.initialImage !== initialImage) {
      this.initialImage = initialImage;
      this.updateShownImage();
    }
  }
  @Input('images') set setImages(images: string[]) {
    if (!isEqual(this.images, images)) {
      this.images = images;
      this.updateShownImage();
    }
  }

  @Input() container: MediaContainerType.Images;
  @Input() fitToWidth = true;
  @Input() fitToHeight = false;
  @Input() height: number;
  @Input() options: SwiperOptions;
  @Input() showThumbs = false;
  @Input() showPrevNext = true;
  @Input() usePagination = false;
  @Input() width: number;

  @ViewChild('swiperContainer', { static: true }) swiperContainer: ElementRef;
  @ViewChild('thumbsWrapper', { static: true }) thumbsWrapper: ElementRef;

  swiper: Swiper;

  thumbsSwiper: Swiper;

  private isImagesInit: boolean;

  ngOnInit(): void {
    const self = this;

    this.options = Object.assign({},
      defaultImageSliderOptions,
      {
        paginationHide: !this.usePagination,
        onSlideChangeEnd: (swiper: Swiper) => {
          const activeIndex = swiper.activeIndex;
          if (this.showThumbs) {
            self.thumbsSwiper.slideTo(activeIndex, 500, false);
          }
        },
        paginationBulletRender: (swiper: Swiper, index: number, className: string) => {
          /* swiper.js creates bullets automatically, therefore they don't have "_ngcontent_..." attribute
           and styles are not applied to them. Get current "_ngcontent" attribute using getNgContextAttribute(...) */

          const ngContentAttribute = self.getNgContextAttribute(self.swiperContainer.nativeElement);
          return `<span ${ngContentAttribute} class="swiper-pagination-bullet"></span>`;
        }
      },
      this.options
    );
  }

  ngAfterViewInit(): void {
    const thumbsOptions: SwiperOptions = defaultThumbsOptions;
    this.swiper = new Swiper(this.swiperContainer.nativeElement, this.options);

    if (this.showThumbs) {
      this.thumbsSwiper = new Swiper(this.thumbsWrapper.nativeElement, thumbsOptions);
      this.swiper.params.controller.control = this.thumbsSwiper;
      this.thumbsSwiper.params.controller.control = this.swiper;
    }
  }

  ngAfterViewChecked(): void {
    if (this.swiperContainer && this.images && !this.isImagesInit) {
      this.swiper.update();
      this.isImagesInit = true;
      this.updateShownImage();
    }
  }

  update(): void {
    if (this.swiper) {
      this.swiper.update();
    }
  }

  thumbClicked(index: number): void {
    this.swiper.slideTo(index, 500, false);
  }

  /**
   * Returns _ngcontent... attribute from element
   * @param nativeElement
   */
  private getNgContextAttribute(nativeElement: HTMLElement): string {
    for (let i = 0; i < nativeElement.attributes.length; ++i) {
      let attribute = nativeElement.attributes[i];
      if (attribute.name.indexOf('_ngcontent') === 0) {
        return attribute.name;
      }
    }
    return '';
  }

  private updateShownImage(): void {
    if (this.isImagesInit && this.images && this.initialImage) {
      const index = this.images.findIndex(
        value => value === this.initialImage);
      if ( index >= 0 ) {
        this.swiper.slideTo(index, 0, false);
      }
    }
  }
}
