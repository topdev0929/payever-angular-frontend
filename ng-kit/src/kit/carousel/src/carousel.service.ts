import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class CarouselService {
  carouselClosed$: Subject<boolean> = new Subject<boolean>();
  carouselOpened$: Subject<boolean> = new Subject<boolean>();

  closeCarousel() {
    this.carouselClosed$.next(true);
  }
  openCarousel() {
    this.carouselOpened$.next(true);
  }
}
