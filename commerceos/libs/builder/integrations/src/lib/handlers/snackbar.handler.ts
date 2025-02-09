import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';

import { PebIntegrationEventAction } from '@pe/builder/core';

import { PebIntegrationActionInvokerService } from '../services/integration-action-invoker.service';
import { PebIntegrationSnackbarService } from '../services/integration-snackbar.service';

@Injectable()
export class PebIntegrationSnackbarHandler implements OnDestroy {

  private destroy$ = new Subject<void>();
  
  constructor(
    private readonly actions$: Actions,
    private readonly actionInvoker: PebIntegrationActionInvokerService,
    private readonly snackbar: PebIntegrationSnackbarService,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebIntegrationEventAction),
      filter(({ event }) => event.startsWith('shared.snackbar')),
      switchMap(({ payload }) => this.actionInvoker.runAction(
        (params: any) => this.snackbar.toggle(true, params),
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

  fetch(params: any): Observable<any> {
    return of({ isSuccess: true, isMokResponse: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
