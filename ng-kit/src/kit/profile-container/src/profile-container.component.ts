import {
  Component,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EventEmitter
} from '@angular/core';
import {
  ProfileContainerLayout,
  ProfileContainerItem,
  ProfileContainerThemeType,
  SelectedProfileContainerItem
} from './profile-container.interface';

@Component({
  selector: 'pe-profile-container',
  styleUrls: ['profile-container.component.scss'],
  templateUrl: 'profile-container.component.html'
})

export class ProfileContainerComponent implements AfterViewInit  {

  @ViewChild('swiperContainer', { static: true }) swiperContainer: ElementRef;
  @ViewChild('swiperPagination', { static: true }) swiperPagination: ElementRef;
  @ViewChild('arrowLeft', { static: true }) arrowLeft: ElementRef;
  @ViewChild('arrowRight', { static: true }) arrowRight: ElementRef;
  @Input() containerItems: ProfileContainerItem[];
  @Input() containerPrivateItem: ProfileContainerItem;
  @Input() partnerPrivateItem: ProfileContainerItem[];
  @Input() isPaginationHidden: boolean;
  @Input() isSwitchedOff: boolean;
  @Input() isControlsHidden: boolean;
  @Input() showEditButton: boolean;
  @Input() editText: boolean;
  @Input() containerTheme: ProfileContainerThemeType = 'light';

  @Input() profileLayout: ProfileContainerLayout = {
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

  @Output('selectItemEvent') selectItemEvent: EventEmitter<SelectedProfileContainerItem> = new EventEmitter();
  @Output('editItemEvent') editItemEvent: EventEmitter<SelectedProfileContainerItem> = new EventEmitter();

  isMobile: boolean;
  swiper: Swiper;
  private swiperConfig: SwiperOptions;

  ngAfterViewInit(): void {
    this.setUpSwiperConfigs();

    setTimeout(() => {
      this.activateSwiper();
    });
  }

  setUpSwiperConfigs(): void {
    this.swiperConfig = {
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: this.arrowRight.nativeElement,
        prevEl: this.arrowLeft.nativeElement
      },
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 100,
      spaceBetween: 0
    };

    if ( this.isMobile ) {
      this.swiperConfig = Object.assign(this.swiperConfig, this.profileLayout['mobile']);
    } else {
      this.swiperConfig = Object.assign(this.swiperConfig, this.profileLayout['desktop']);
    }

    if ( (this.containerItems.length + 1) <= this.swiperConfig.slidesPerView ) {
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

  onItemSelect(event: MouseEvent, item: ProfileContainerItem): void {
    this.selectItemEvent.emit({'event': event, 'item': item});

    if ( typeof item.onSelect === 'function') {
      item.onSelect(event , item);
    }
  }

  onItemEditClick(event: MouseEvent, item: ProfileContainerItem): void {
    event.stopPropagation();
    this.editItemEvent.emit({'event': event, 'item': item});
  }
}
