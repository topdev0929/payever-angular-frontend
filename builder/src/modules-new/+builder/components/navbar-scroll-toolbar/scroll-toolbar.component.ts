import { AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { TouchEventsNewService } from '../../services/touch-events.service';

enum ArrowPosition {
  Left = 'left',
  Right = 'right',
}

const SCROLL_STEP = 10;
const SCROLL_TIMEOUT = 5;
const MIN_SCROLL_OFFSET = 50;

@Component({
  selector: 'pe-builder-scroll-toolbar',
  templateUrl: 'scroll-toolbar.component.html',
  styleUrls: ['scroll-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToolbarComponent extends AbstractComponent implements OnInit, AfterContentChecked {
  @Input() active: boolean;

  @ViewChild('contentWrapper', { read: ElementRef, static: true }) contentWrapper: ElementRef<HTMLElement>;
  @ViewChild('leftArrow', { read: ElementRef, static: true }) leftArrow: ElementRef<HTMLElement>;
  @ViewChild('rightArrow', { read: ElementRef, static: true }) rightArrow: ElementRef<HTMLElement>;

  showScroll$: Observable<boolean>;

  private readonly contentChanged$ = new EventEmitter();

  ArrowPosition = ArrowPosition;

  allowScrollLeft: boolean;
  allowScrollRight: boolean;

  private subscription: Subscription;
  private timerActive = false;
  private currentScrollOffset = 0;

  constructor(
    private chRef: ChangeDetectorRef,
    private touchEventsService: TouchEventsNewService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.showScroll$ = this.contentChanged$.pipe(
      debounceTime(100),
      map(() => this.contentWrapper.nativeElement.scrollWidth > this.contentWrapper.nativeElement.offsetWidth),
      distinctUntilChanged(),
    );

    this.touchEventsService
      .getEventObservable(this.leftArrow.nativeElement, 'mousedown')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onArrowMouseDown(ArrowPosition.Left);
      });
    this.touchEventsService
      .getEventObservable(this.leftArrow.nativeElement, 'mouseup')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onArrowMouseUp(ArrowPosition.Left);
      });
    this.touchEventsService
      .getEventObservable(this.rightArrow.nativeElement, 'mousedown')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onArrowMouseDown(ArrowPosition.Right);
      });
    this.touchEventsService
      .getEventObservable(this.rightArrow.nativeElement, 'mouseup')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onArrowMouseUp(ArrowPosition.Right);
      });
  }

  ngAfterContentChecked(): void {
    this.contentChanged$.emit();
  }

  onArrowMouseDown(position: ArrowPosition): void {
    this.scroll(position);
    this.timerActive = true;
    this.currentScrollOffset = 0;
    this.unsubscribe();
    this.subscription = interval(SCROLL_TIMEOUT).subscribe(() => {
      this.scroll(position);
      if (!this.timerActive && this.currentScrollOffset >= MIN_SCROLL_OFFSET) {
        this.unsubscribe();
      }
    });
  }

  onArrowMouseUp(position: ArrowPosition): void {
    this.timerActive = false;
    const element: HTMLElement = this.contentWrapper.nativeElement;
    if (
      (position === ArrowPosition.Left && element.scrollLeft === 0) ||
      (position === ArrowPosition.Right && element.scrollLeft === element.scrollWidth)
    ) {
      this.unsubscribe();
    }
  }

  allowScroll(position: ArrowPosition): boolean {
    const element: HTMLElement = this.contentWrapper.nativeElement;

    return position === ArrowPosition.Left
      ? element.scrollLeft > 0
      : element.scrollLeft < element.scrollWidth - element.offsetWidth;
  }

  private scroll(position: ArrowPosition): void {
    const element: HTMLElement = this.contentWrapper.nativeElement;
    let scrollOffset: number;
    if (position === ArrowPosition.Left) {
      scrollOffset = element.scrollLeft >= SCROLL_STEP ? SCROLL_STEP * -1 : element.scrollLeft * -1;
    } else {
      scrollOffset =
        element.scrollWidth - element.scrollLeft >= SCROLL_STEP
          ? SCROLL_STEP
          : element.scrollWidth - element.scrollLeft;
    }
    element.scrollLeft += scrollOffset;
    this.currentScrollOffset += Math.abs(scrollOffset);
    this.checkScrollArrows();
  }

  private unsubscribe(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private checkScrollArrows(): void {
    const allowScrollLeft: boolean = this.allowScroll(ArrowPosition.Left);
    let changed = false;
    if (allowScrollLeft !== this.allowScrollLeft) {
      this.allowScrollLeft = allowScrollLeft;
      changed = true;
    }
    const allowScrollRight: boolean = this.allowScroll(ArrowPosition.Right);
    if (allowScrollRight !== this.allowScrollRight) {
      this.allowScrollRight = allowScrollRight;
      changed = true;
    }
    if (changed) {
      this.chRef.detectChanges();
    }
  }
}
