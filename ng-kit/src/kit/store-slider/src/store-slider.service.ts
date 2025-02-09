import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable()
export class StoreSliderService implements OnDestroy {

  private timerObservable: Observable<number>;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  startIntervalTimer = (duration: number) => {
    this.timerObservable = interval(duration)
      .pipe(
        takeUntil(this.destroy$),
        map((i: number) => i)
      );
    return this.timerObservable;
  };

  destroyIntervalTimer = () => {
    this.destroy$.next(true);
  };

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
