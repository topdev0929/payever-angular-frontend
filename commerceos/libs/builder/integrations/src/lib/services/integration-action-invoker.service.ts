import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { EMPTY, isObservable, Observable, of } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';

import { evaluate, PebContext, PebIntegrationAction, PebIntegrationEventAction } from '@pe/builder/core';

@Injectable({ providedIn: 'any' })
export class PebIntegrationActionInvokerService {

  constructor(
    private readonly store: Store,
  ) {
  }

  runAction(
    callBack?: (param: any) => unknown,
    action?: PebIntegrationAction,
    context?: PebContext,
  ): Observable<any> {

    if (!callBack || !action) {
      return EMPTY;
    }

    const params = {
      ...action.staticParams,
      ...evaluate(action.dynamicParams, context),
    };
    const result = callBack(params);
    const run$ = isObservable(result) ? result : of(result);

    return run$.pipe(
      switchMap((result: any) => this.runInnerAction(action.onSuccess, context)),
      catchError((err: any) => this.runInnerAction(action.onError, context)),
      switchMap(() => this.runInnerAction(action.finally, context)),
      shareReplay(),
    );
  }

  runInnerAction(action?: PebIntegrationAction, context?: PebContext): Observable<any> {
    if (!action) {
      return EMPTY;
    }

    return this.store.dispatch(new PebIntegrationEventAction(action.method, { action, context }));
  }
}
