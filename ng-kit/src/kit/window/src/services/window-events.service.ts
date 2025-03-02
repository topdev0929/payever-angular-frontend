import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { AbstractService } from '../../../common';

@Injectable()
export class WindowEventsService extends AbstractService implements OnDestroy {

  private destroyed$: Subject<void> = new Subject();

  constructor() {
    super();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  message$(destroyed$: Subject<any> = null): Observable<any> {
    return this.getDataMessageFlow().pipe(takeUntil(destroyed$ || this.destroyed$), filter(d => !!d));
  }

  private getDataMessageFlow(): Observable<any> {
    // TODO Find better way to avoid multiple instances across web components
    const key: string = 'pe_windowEventService_message';
    let dataFlow: BehaviorSubject<any> = window[key];
    if (!window[key]) {
      dataFlow = new BehaviorSubject<any>(null);
      window[key] = dataFlow;

      fromEvent(window, 'message').pipe(
        takeUntil(this.destroyed$)
      ).subscribe(event => dataFlow.next(event));
    }
    return dataFlow.asObservable();
  }
}
