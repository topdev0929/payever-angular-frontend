import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { EMPTY, interval, Observable, of, Subject } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebIntegrationEventAction } from '@pe/builder/core';

import { PebIntegrationActionInvokerService } from '../services/integration-action-invoker.service';


@Injectable()
export class PebIntegrationMockHandler implements OnDestroy {

  handlers: any = {
    'mock.log': (params: any) => console.log(params),
    'mock.alert': (params: any) => alert(params),
    'mock.error': (params: any) => { throw new Error(params); },
    'mock.interval': (params: any) => interval(2000).pipe(take(1), tap(() => console.log('Finish'))),
  };

  private destroy$ = new Subject<void>();

  constructor(
    private readonly actions$: Actions,
    private readonly actionInvoker: PebIntegrationActionInvokerService,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebIntegrationEventAction),
      filter(({ event }) => event.startsWith('mock.')),
      switchMap(({ event, payload }) => this.actionInvoker.runAction(
        this.handlers[event]?.bind(this),
        payload.action,
        payload.context,
      )),
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error(err);

        return EMPTY;
      })
    ).subscribe();
  }

  init(): Observable<boolean> {
    return of(true);
  }

  fetch(params: any): Observable<any> {
    return of({ isSuccess: true, isMokResponse: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
