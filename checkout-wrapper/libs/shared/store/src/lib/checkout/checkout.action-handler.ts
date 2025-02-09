import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionCompleted, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Subject } from 'rxjs';
import { filter, first, takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { FlowStateEnum } from '@pe/checkout/types';

import { FlowState, SetClonedFlow, SetFlow } from '../flow';

import { HidePayment, SetPaymentComplete } from './checkout.actions';
import { CheckoutState } from './checkout.state';

@Injectable({
  providedIn: 'root',
})
export class CheckoutActionHandler implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private flowStorage: FlowStorage,
  ) {

    const storeHiddenPayments$ = this.actions$.pipe(
      ofActionCompleted(HidePayment, SetClonedFlow),
      tap(() => {
        const flow = this.store.selectSnapshot(FlowState.flow);
        const hiddenPayments = this.store.selectSnapshot(CheckoutState.hiddenPayments);

        this.flowStorage.setData(flow.id, 'steppermanagerhiddenPayments', hiddenPayments);
      }),
    );

    const initHiddenPayments$ = this.store.select(FlowState.flow).pipe(
      filter(flow => !!flow),
      first(),
      tap((flow) => {
        const hiddenPayments = this.flowStorage.getData(flow.id, 'steppermanagerhiddenPayments');
        hiddenPayments && this.store.dispatch(new HidePayment(hiddenPayments));
      }),
    );

    const setFlow$ = this.actions$.pipe(
      ofActionSuccessful(SetFlow),
      tap((action) => {
        const flow = action.payload;
        if (flow?.state !== FlowStateEnum.PROGRESS) {
          this.store.dispatch(new SetPaymentComplete());
        }
      }),
    );

    merge(
      storeHiddenPayments$,
      initHiddenPayments$,
      setFlow$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
