import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { forkJoin, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { CheckoutWindow, FlowInterface } from '@pe/checkout/types';

import { CloneFlow, InitFlow } from './flow.actions';
import { FlowState } from './flow.state';

@Injectable({
  providedIn: 'root',
})
export class FlowActionHandler implements OnDestroy {

  private destroy$ = new Subject<void>();
  private loader = (window as CheckoutWindow).pe_pageFlowLoader;

  constructor(
    private store: Store,
    private actions$: Actions,
    private flowStorage: FlowStorage,
  ) {
    this.initLoader();

    const cloneFlow$ = forkJoin({
      flow: this.store.selectOnce(FlowState.flow),
      action: this.actions$.pipe(
        ofActionSuccessful(CloneFlow),
      ),
    }).pipe(
      tap(({ flow, action }) => {
        if (!action.payload.skipData) {
          const clonedFlowId = this.store.selectSnapshot(FlowState.flowId);
          this.flowStorage.clone(flow.id, clonedFlowId);
        }
      }),
    );

    merge(
      cloneFlow$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initLoader(): void {
    if (this.loader?.flowData) {
      this.store.dispatch(new InitFlow(this.loader.flowData));
    } else if (this.loader) {
      this.loader.successCallback = (data: FlowInterface) => {
        this.store.dispatch(new InitFlow(data));
      };

      this.loader.errorCallback = (message) => {
        this.handleError();
      };

      if (this.loader.lastError) {
        this.handleError();
      }
    }
  }

  private handleError(): void {
    return;
  }
}
