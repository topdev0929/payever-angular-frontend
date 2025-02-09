import { AfterContentInit, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { peVariables, PeVariablesInterface } from '../../../pe-variables';
import { DomSanitizer } from '@angular/platform-browser';
import { StoreSliderInterface, StoreSliderActionInterface } from '../..';
import { StoreSliderService } from '../store-slider.service';
import { UI_STORE_SLIDER_PRESETS } from './store-slider-presets';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pe-store-slider',
  templateUrl: 'store-slider.component.html',
  styleUrls: ['store-slider.component.scss']
})

export class StoreSliderComponent implements AfterContentInit, OnInit {
  @Input() isEditorActive: boolean = true;
  @Input() finishButtonName: string = 'Done';
  @Input()
  set slides(slides: StoreSliderInterface[])  {
    this.internalSlides = slides;
  }
  get slides(): StoreSliderInterface[] {
    return this.internalSlides;
  }
  @Input()
  set isButtonsActive(isActive: boolean)  {
    this.isButtonsActiveInternal = isActive;
    this.actions[0].isActive = isActive;
  }
  get isButtonsActive(): boolean {
    return this.isButtonsActiveInternal;
  }
  @Input()
  set isAutoRotateActive(isActive: boolean)  {
    this.isAutoRotateActiveInternal = isActive;
    this.actions[1].isActive = isActive;
    if (isActive) {
      this.startAutorotate();
    }
  }
  get isAutoRotateActive(): boolean {
    return this.isAutoRotateActiveInternal;
  }
  @Input()
  set isArrowsActive(isActive: boolean)  {
    this.isArrowsActiveInternal = isActive;
    this.actions[2].isActive = isActive;
  }
  get isArrowsActive(): boolean {
    return this.isArrowsActiveInternal;
  }

  @Output() onEditorClosed: EventEmitter<void> = new EventEmitter<void>();
  @Output() onButtonsActiveChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onAutorotateActiveChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onArrowsActiveChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  actions: StoreSliderActionInterface[] = UI_STORE_SLIDER_PRESETS;
  public peVariables: PeVariablesInterface = peVariables;

  internalSlides: StoreSliderInterface[] = [];
  isButtonsActiveInternal: boolean;
  isAutoRotateActiveInternal: boolean;
  isArrowsActiveInternal: boolean;

  activeSlideIndex: number = 0;
  prevSlideIndex: number = -1;
  nextSlideIndex: number = -1;
  leftSlidesIndexes: number[] = [];
  rightSlidesIndexes: number[] = [];

  private isRotatePause: boolean = false;
  private autoRotateInterval: number = 5000;
  private animationDuration: number = 600;

  private timerIntervalSubscription: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private storeSliderService: StoreSliderService,
  ) {}

  ngOnInit() {
    this.animationDuration = this.peVariables.toNumber('pe_duration_slide_in');
  }

  ngAfterContentInit() {
    this.init();
  }

  getBackground(image: string): any {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  goToNextSlide() {
    if (!this.isRotatePause) {
      this.isRotatePause = true;
      this.nextSlideIndex = (this.activeSlideIndex >= this.internalSlides.length - 1) ? 0 : (this.activeSlideIndex + 1);

      setTimeout(() => {
        this.leftSlidesIndexes.push(this.activeSlideIndex);
        this.leftSlidesIndexes.push(this.nextSlideIndex);

        setTimeout(() => {
          this.activeSlideIndex = this.nextSlideIndex;
          this.leftSlidesIndexes = [];
          this.nextSlideIndex = -1;
          this.isRotatePause = false;
        },         this.animationDuration);
      });
    }
  }

  goToPreviousSlide() {
    if (!this.isRotatePause) {
      this.isRotatePause = true;
      this.prevSlideIndex = (this.activeSlideIndex >= this.internalSlides.length - 1) ? 0 : (this.activeSlideIndex + 1);

      setTimeout(() => {
        this.rightSlidesIndexes.push(this.activeSlideIndex);
        this.rightSlidesIndexes.push(this.prevSlideIndex);

        setTimeout(() => {
          this.activeSlideIndex = this.prevSlideIndex;
          this.rightSlidesIndexes = [];
          this.prevSlideIndex = -1;
          this.isRotatePause = false;
        },         this.animationDuration);
      });
    }
  }

  goToSlide(index: number) {
    if (!this.isRotatePause) {
      this.isRotatePause = true;
      this.nextSlideIndex = index;

      setTimeout(() => {
        this.leftSlidesIndexes.push(this.activeSlideIndex);
        this.leftSlidesIndexes.push(this.nextSlideIndex);

        setTimeout(() => {
          this.activeSlideIndex = this.nextSlideIndex;
          this.leftSlidesIndexes = [];
          this.nextSlideIndex = -1;
          this.isRotatePause = false;
        },         this.animationDuration);
      });
    }
  }

  onActionSelected(action: StoreSliderActionInterface) {
    const isActionOn = (action.isActive) ? false : true;
    action.isActive = isActionOn;

    if (action.name === 'store-slider-buttons') {
      this.isButtonsActiveInternal = isActionOn;
      this.onButtonsActiveChanged.emit(isActionOn);
    } else if (action.name === 'store-slider-rotate') {
      this.isAutoRotateActiveInternal = isActionOn;
      this.onAutorotateActiveChanged.emit(isActionOn);
      if (isActionOn) {
        this.startAutorotate();
      }
    } else if (action.name === 'store-slider-arrows') {
      this.isArrowsActiveInternal = isActionOn;
      this.onArrowsActiveChanged.emit(isActionOn);
    }
  }

  onFinishButtonClick(): void {
    this.onEditorClosed.emit();
  }

  private startAutorotate() {
    this.timerIntervalSubscription = this.storeSliderService.startIntervalTimer(this.autoRotateInterval)
      .subscribe((i: number) => {
        if (this.isAutoRotateActiveInternal) {
          if (!this.isRotatePause) {
            this.goToNextSlide();
          }
        } else {
          this.storeSliderService.destroyIntervalTimer();
          this.timerIntervalSubscription.unsubscribe();
        }
      });
  }

  private init() {
    this.actions.map((action: StoreSliderActionInterface) => {
      if ((action.name === 'store-slider-buttons') && (this.isButtonsActiveInternal === undefined)) {
        this.isButtonsActiveInternal = action.isActive;
      } else if ((action.name === 'store-slider-rotate') && (this.isAutoRotateActiveInternal === undefined)) {
        this.isAutoRotateActiveInternal = action.isActive;
        if (action.isActive) {
          this.startAutorotate();
        }
      } else if ((action.name === 'store-slider-arrows') && (this.isArrowsActiveInternal === undefined)) {
        this.isArrowsActiveInternal = action.isActive;
      }
    });
  }

  ngOnDestroy() {
    if (this.timerIntervalSubscription) {
      this.timerIntervalSubscription.unsubscribe();
    }
  }
}
