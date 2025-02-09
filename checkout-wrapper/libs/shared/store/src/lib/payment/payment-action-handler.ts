import { Injectable, OnDestroy } from '@angular/core';
import {
  Store,
  Actions,
  ofActionCompleted,
  ofActionDispatched,
  ofActionSuccessful,
} from '@ngxs/store';
import { Subject, merge } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { FlowStateEnum } from '@pe/checkout/types';

import { SetPaymentComplete, SetPrevAction } from '../checkout';
import { FinishFlow, FlowState } from '../flow';

import { PaymentProxyService } from './payment-proxy.service';
import {
  GetPaymentOptions,
  PatchFormState,
  PatchPaymentDetails,
  PatchPaymentResponse,
  SetFormState,
  SetPaymentDetails,
  SetPaymentError,
  SetPaymentOptions,
  SetPaymentService,
  SetPayments,
  SubmitPayment,
  UpdatePayment,
} from './payment.actions';
import { PaymentState } from './payment.state';

@Injectable({
  providedIn: 'root',
})
export class PaymentActionHandler implements OnDestroy{
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private flowStorage: FlowStorage,
    private paymentProxy: PaymentProxyService,
  ) {
    const patchStorage$ = this.store.select(FlowState.flow).pipe(
      filter(value => !!value),
      tap((flow) => {
        const data = this.flowStorage.getData(flow.id, 'paymentData');
        !!data && this.store.dispatch(new SetPayments(data));
      }),
      switchMap(flow => this.actions$.pipe(
        ofActionSuccessful(
          PatchPaymentDetails,
          SetPaymentDetails,
          PatchPaymentResponse,
          SetPaymentOptions,
          PatchFormState,
          SetFormState,
          SetPaymentError,
        ),
        tap(() => {
          const state = this.store.selectSnapshot(PaymentState);
          this.flowStorage.setData(flow.id, 'paymentData', state);
        }),
      )),
    );

    const setPaymentService$ = this.actions$.pipe(
      ofActionDispatched(SetPaymentService),
      tap(({ paymentService }) => {
        this.paymentProxy.setPaymentService(paymentService);
      }),
    );

    const submitPayment$ = this.actions$.pipe(
      ofActionDispatched(SubmitPayment),
      filter(() => {
        const flow = this.store.selectSnapshot(FlowState.flow);

        return flow.state !== FlowStateEnum.FINISH;
      }),
      switchMap(() => this.paymentProxy.postPayment().pipe(
        switchMap(() => this.store.dispatch([
          new FinishFlow(),
        ]).pipe(
          tap(() => {
            this.paymentProxy.redirect();
            this.store.dispatch(new SetPaymentError(null)).pipe(
              switchMap(() => this.store.dispatch(new SetPaymentComplete())),
            );
          }),
        )),
      )),
    );

    const paymentErrors$ = this.actions$.pipe(
      ofActionCompleted(
        SubmitPayment,
        GetPaymentOptions,
        UpdatePayment,
      ),
      filter(({ result }) => !!result?.error),
      tap(({ action, result: { error } }) => {
        this.store.dispatch([
          new SetPaymentError((error as any)),
          new SetPaymentComplete(true, action),
          new SetPrevAction(this.prevActionFactory(action)),
        ]);
      }),
    );

    merge(
      patchStorage$,
      setPaymentService$,
      submitPayment$,
      paymentErrors$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  prevActionFactory(action: SubmitPayment | GetPaymentOptions | UpdatePayment): InstanceType<any> | null {
    return action instanceof GetPaymentOptions ? new GetPaymentOptions() : null;
  }
}
