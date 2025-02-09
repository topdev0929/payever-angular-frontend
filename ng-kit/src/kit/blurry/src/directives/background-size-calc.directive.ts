import { Directive, ElementRef, OnDestroy, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WindowService } from '../../../window';

/**
 * logic for repeat functionality of (background-size: cover)
 */

@Directive({
  selector: '[peWindowBgSize]'
})
export class BackgroundSizeCalcDirective implements OnInit, AfterViewInit, OnDestroy {
  imgHeight: number = 1080; // should be same with size of bg image. need to find way to get this data by another way
  imgWidth: number = 1920;
  containerHeight: number = window.innerHeight;
  containerWidth: number = window.innerWidth;
  imgRatio: number = this.imgHeight / this.imgWidth;
  containerRatio: number = this.getContainerRatio();

  finalWidth: number;
  finalHeight: number;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private windowService: WindowService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.windowService.width$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((width: number) => {
        this.containerWidth = width;
        this.containerRatio = this.getContainerRatio();
        this.calculateFinalSize();
        this.update();
      });
    this.windowService.height$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((height: number) => {
        this.containerHeight = height;
        this.containerRatio = this.getContainerRatio();
        this.calculateFinalSize();
        this.update();
      });
  }

  ngAfterViewInit(): void {
    this.calculateFinalSize();
    this.update();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private getContainerRatio(): number {
    return this.containerHeight / this.containerWidth;
  }

  private calculateFinalSize(): void {
    if (this.containerRatio > this.imgRatio) {
      this.finalHeight = this.containerHeight;
      this.finalWidth = (this.containerHeight / this.imgRatio);
    } else {
      this.finalWidth = this.containerWidth;
      this.finalHeight = (this.containerWidth * this.imgRatio);
    }
  }

  private update(): void {
    const element: HTMLElement = (this.elementRef.nativeElement as HTMLElement);
    this.renderer.setStyle(element, 'background-size', `${this.finalWidth}px ${this.finalHeight + 1}px`);
  }
}
