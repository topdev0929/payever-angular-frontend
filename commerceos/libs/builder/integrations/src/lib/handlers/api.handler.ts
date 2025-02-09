import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';

import { PebIntegrationEventAction } from '@pe/builder/core';

import { PebIntegrationActionInvokerService } from '../services/integration-action-invoker.service';

@Injectable()
export class PebIntegrationApiHandler implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private readonly actions$: Actions,
    private readonly actionInvoker: PebIntegrationActionInvokerService,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebIntegrationEventAction),
      filter(({ event }) => event === 'api.fetch'),
      switchMap(({ payload }) => this.actionInvoker.runAction(
        this.fetch.bind(this),
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
