import { OnInit, Directive, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { DevModeService } from '../../../dev';

@Directive({
  selector: '[pePreventDoubleTapZoom]'
})
export class PreventDoubleTapZoomDirective implements OnInit, OnDestroy {

  @Input() pePreventDoubleTapZoomSelector: string;

  private readonly eventsDelta: number = 500;
  private readonly lastTouchDatasetKey: string = 'lastTouch';

  private readonly destroyed$: Subject<boolean> = new Subject();

  constructor(
    private devMode: DevModeService,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.handleMobileDoubleTap();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private handleMobileDoubleTap(): void {
    const targetElement: HTMLElement = this.pePreventDoubleTapZoomSelector ?
      document.querySelector(this.pePreventDoubleTapZoomSelector) :
      this.el.nativeElement;

    if (targetElement) {
      // NOTE: @HostListener decorator isn't work here
      const unlisten: () => void = this.renderer.listen(targetElement, 'touchstart', this.preventEventOnClick);
      this.destroyed$.subscribe(unlisten);
    } else if (this.devMode.isDevMode()) {
      // tslint:disable-next-line no-console
      console.warn(
        `[pePreventDoubleTapZoom]: Cannot find element by selector "${this.pePreventDoubleTapZoomSelector}" to prevent zoom on double tap`
      );
    }
  }

  // Popular trick to prevent zoom functionality on iOS devices
  // Sources:
  // https://stackoverflow.com/questions/10614481/disable-double-tap-zoom-option-in-browser-on-touch-devices
  private preventEventOnClick = (evt: TouchEvent): void => {
    const currentTarget: HTMLElement = evt.currentTarget as HTMLElement;
    const now: number = evt.timeStamp;
    const lastTouch: number = Number(currentTarget.dataset[this.lastTouchDatasetKey]) || now;
    const delta: number = now - lastTouch;
    const fingers: number = evt.touches.length;

    currentTarget.dataset[this.lastTouchDatasetKey] = String(now);

    if (!delta || delta > this.eventsDelta || fingers > 1) {
      return;
    } else {
      // double tap - prevent the zoom

      // Old devices capability
      if (evt.stopImmediatePropagation) {
        evt.stopImmediatePropagation();
      } else if (evt.stopPropagation) {
        evt.stopPropagation();
      } else {
        evt.cancelBubble = true;
      }

      evt.preventDefault();
    }
  }
}
