import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

/* @deprecated */
@Injectable()
export class WindowEventsService implements OnDestroy {

  private destroy$ = new Subject<void>();

  message$(): Observable<any> {
    return this.getDataMessageFlow().pipe(
      filter(d => !!d),
      takeUntil(this.destroy$),
    );
  }

  private getDataMessageFlow(): Observable<any> {
    // TODO Find better way to avoid multiple instances across web components
    const key = 'pe_windowEventService_message';
    let dataFlow: BehaviorSubject<any> = (window as any)[key];
    if (!(window as any)[key]) {
      dataFlow = new BehaviorSubject<any>(null);
      (window as any)[key] = dataFlow;

      fromEvent(window, 'message').pipe(
        takeUntil(this.destroy$),
      ).subscribe(event => dataFlow.next(event));
    }

    return dataFlow.asObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
