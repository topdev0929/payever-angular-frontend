import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import {
  AppContainerLayout,
  AppContainerItem
} from './app-container.interface';

@Component({
  selector: 'pe-app-container',
  styleUrls: ['app-container.component.scss'],
  templateUrl: 'app-container.component.html'
})

export class AppContainerComponent implements AfterViewInit  {

  @ViewChild('swiperContainer', { static: true }) swiperContainer: ElementRef;
  @ViewChild('swiperPagination', { static: true }) swiperPagination: ElementRef;
  @ViewChild('arrowLeft', { static: true }) arrowLeft: ElementRef;
  @ViewChild('arrowRight', { static: true }) arrowRight: ElementRef;
  @Input() containerItems: AppContainerItem[];
  @Input() isPaginationHidden: boolean;
  @Input() isControlsHidden: boolean;

  @Input() appLayout: AppContainerLayout = {
    desktop: {
      slidesPerView: 2,
      slidesPerColumn: 1,
      slidesPerGroup: 2
    },
    mobile: {
      slidesPerView: 2,
      slidesPerColumn: 2,
      slidesPerGroup: 4
    }
  };

  @Input() set isSwiperMobile(isSwiperMobile: boolean) {
    this.isMobile = isSwiperMobile;
    this.destroySwiper();
    this.setUpSwiperConfigs();

    setTimeout(() => {
      this.activateSwiper();
    });
  }

  swiper: Swiper;
  isMobile: boolean;

  private swiperConfig: any;

  ngAfterViewInit(): void {
    this.setUpSwiperConfigs();

    setTimeout(() => {
      this.activateSwiper();
    });
  }

  setUpSwiperConfigs(): void {
    this.swiperConfig = {
      pagination: this.swiperPagination.nativeElement,
      paginationClickable: true,
      spaceBetween: 0,
      slidesPerColumnFill: 'row',
      nextButton: this.arrowRight.nativeElement,
      prevButton: this.arrowLeft.nativeElement
    };

    if ( this.isMobile ) {
      this.swiperConfig = Object.assign(this.swiperConfig, this.appLayout['mobile']);
    } else {
      this.swiperConfig = Object.assign(this.swiperConfig, this.appLayout['desktop']);
    }

    if ( (this.containerItems.length + 1) <= this.swiperConfig.slidesPerGroup ) {
      this.isPaginationHidden = true;
    }
  }

  activateSwiper(): void {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, this.swiperConfig);
  }

  destroySwiper(): void {
    if ( !this.swiper ) {
      return;
    }
    this.swiper.destroy(true, true);
  }

  onItemSelect(event: MouseEvent, item: AppContainerItem): void {
    if ( typeof item.onSelect === 'function') {
        item.onSelect(event , item);
    }
  }
}
