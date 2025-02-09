import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Injectable()
export class WindowEventsService implements OnDestroy {

  private destroyed$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  message$(destroyed$: Subject<any> = null): Observable<any> {
    return this.getDataMessageFlow().pipe(takeUntil(destroyed$ || this.destroyed$), filter(d => !!d));
  }

  private getDataMessageFlow(): Observable<any> {
    // TODO Find better way to avoid multiple instances across web components
    const key = 'pe_windowEventService_message';
    const win = window as any;
    let dataFlow: BehaviorSubject<any> = win[key];
    if (!win[key]) {
      dataFlow = new BehaviorSubject<any>(null);
      win[key] = dataFlow;

      fromEvent(window, 'message').pipe(
        takeUntil(this.destroyed$)
      ).subscribe(event => dataFlow.next(event));
    }

    return dataFlow.asObservable();
  }
}
