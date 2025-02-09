import {
  Component,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EventEmitter, HostBinding
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CardsContainerLayout,
  CardsContainerItem,
  CardsContainerItemActions,
  CardsConfig
} from './cards-container.interface';

@Component({
  selector: 'pe-cards-container',
  styleUrls: ['cards-container.component.scss'],
  templateUrl: 'cards-container.component.html'
})
export class CardsContainerComponent implements AfterViewInit  {
  private static currentId: number = 0;

  @ViewChild('swiperContainer', { static: true }) swiperContainer: ElementRef;
  @ViewChild('arrowLeft', { static: true }) arrowLeft: ElementRef;
  @ViewChild('arrowRight', { static: true }) arrowRight: ElementRef;
  @Input() set containerEl(items: CardsContainerItem[]) {
    this.containerItems = items;
    this.destroySwiper();
    this.setUpSwiperConfigs();
    setTimeout(() => {
      this.activateSwiper();
    });
  }

  @Input() config: CardsConfig;
  @Input() isPaginationHidden: boolean;
  @Input() isSwitchedOff: boolean;
  @Input() isControlsHidden: boolean;

  @Input() cardsLayout: CardsContainerLayout = {
    desktop: {
      slidesPerView: 4,
      slidesPerColumn: 1,
      slidesPerGroup: 4
    },
    tablet: {
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

  @Input() set isSwiperTablet(isSwiperTablet: boolean) {
      this.isTablet = isSwiperTablet;
      this.destroySwiper();
      this.setUpSwiperConfigs();
      setTimeout(() => {
          this.activateSwiper();
      });
  }

  @Output('selectItemEvent') selectItemEvent: EventEmitter<MouseEvent> = new EventEmitter();

  @HostBinding('attr.id') id: string;

  swiper: Swiper;
  containerItems: CardsContainerItem[] = [];
  isContainerEmpty: boolean;

  private swiperConfig: SwiperOptions;
  private isMobile: boolean;
  private isTablet: boolean;

  constructor(private sanitizer: DomSanitizer) {
    this.id = `pe-cards-container-${CardsContainerComponent.currentId++}`;
  }

  getBackground(image: string): any {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  ngAfterViewInit(): void {
    this.setUpSwiperConfigs();

    setTimeout(() => {
      this.activateSwiper();
    });
  }

  setUpSwiperConfigs(): void {
    this.swiperConfig = {
      pagination: {
        clickable: true,
        el: `#${this.id} .swiper-pagination`
      },
      navigation: {
        nextEl: this.arrowRight.nativeElement,
        prevEl: this.arrowLeft.nativeElement
      },
      spaceBetween: 0
    };

    if ( this.isMobile ) {
      this.swiperConfig = Object.assign(this.swiperConfig, this.cardsLayout['mobile']);
    } else if (this.isTablet) {
      this.swiperConfig = Object.assign(this.swiperConfig, this.cardsLayout['tablet']);
    } else {
      this.swiperConfig = Object.assign(this.swiperConfig, this.cardsLayout['desktop']);
    }

    if ( (this.containerItems.length + 1) <= this.swiperConfig.slidesPerView ) {
      this.isPaginationHidden = true;
    }
  }

  activateSwiper(): void {
    if (this.containerItems.length !== 0) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, this.swiperConfig);
      this.isContainerEmpty = false;
    } else {
      this.isContainerEmpty = true;
    }
  }

  destroySwiper(): void {
    if ( !this.swiper ) {
      return;
    }
    this.swiper.destroy(true, true);
  }

  onAdd(event: MouseEvent, config: CardsConfig): void {
      if ( typeof config.addSelect === 'function') {
          config.addSelect(event);
      }
  }

  onItemSelect(event: MouseEvent, item: CardsContainerItem): void {
    this.selectItemEvent.emit(event);
    if ( typeof item.onSelect === 'function') {
      item.onSelect(event , item);
    }
  }

  onActionSelect(event: MouseEvent, item: CardsContainerItem, action: CardsContainerItemActions): void {
      if ( typeof action.onSelect === 'function') {
          action.onSelect(event, item, action);
      }
  }
}
