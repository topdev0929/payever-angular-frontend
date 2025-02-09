import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { NodeApiService } from '@pe/checkout/api';
import {
  EditPayment,
  PatchPaymentDetails,
  PaymentState,
  PollPaymentForStatus,
  PostPayment,
  SetPaymentDetails,
  UpdatePayment,
} from '@pe/checkout/store';
import {
  NodePaymentResponseInterface,
  PaymentStatusEnum,
  PaymentTerms,
} from '@pe/checkout/types';

import { BaseNodeFlowService } from './base-node-flow.service';


@Injectable({
  providedIn: 'root',
})
export class NodeFlowService extends BaseNodeFlowService {

  private nodeApiService = this.injector.get(NodeApiService);
  private store = this.injector.get(Store);

  setPaymentDetails<PaymentDetailsOrFormToken>(data: PaymentDetailsOrFormToken): Observable<void> {
    return this.store.dispatch(new SetPaymentDetails(data));
  }

  assignPaymentDetails<PaymentDetailsOrFormToken>(
    data: PaymentDetailsOrFormToken,
  ): Observable<void> {
    return this.store.dispatch(new PatchPaymentDetails(data));
  }

  getPaymentData<PaymentDetailsOrFormToken>(): PaymentDetailsOrFormToken {
    return this.store.selectSnapshot(PaymentState.details);
  }

  getFinalResponse<PaymentResponseDetails>(): NodePaymentResponseInterface<PaymentResponseDetails> {
    return this.paymentMethod && this.store.selectSnapshot(PaymentState.response);
  }

  getApplicationData<PaymentResponseDetails>(
    transactionId: string
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.nodeApiService.getApplicationData<NodePaymentResponseInterface<PaymentResponseDetails>>(
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
      transactionId,
    );
  }

  getCreditRates<TRates, TParams>(params: TParams): Observable<TRates> {
    return this.nodeApiService.getCreditRates<TRates, TParams>(
      params,
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
    );
  }

  postPayment<PaymentResponseDetails>(): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.store.dispatch(new PostPayment()).pipe(
      map(() => this.store.selectSnapshot(PaymentState.response)),
      catchError(() => EMPTY)
    );
  }

  editTransaction<PaymentResponseDetails>(
    paymentId: string
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.store.dispatch(new EditPayment(paymentId)).pipe(
      map(() => this.store.selectSnapshot(PaymentState.response)),
    );
  }

  updatePayment<PaymentResponseDetails>():
    Observable<NodePaymentResponseInterface<PaymentResponseDetails>>
  {
    return this.store.selectOnce(PaymentState.response).pipe(
      switchMap(paymentResponse => this.store.dispatch(new UpdatePayment(paymentResponse.id)).pipe(
        map(() => this.store.selectSnapshot(PaymentState.response)),
      ))
    );
  }

  pollPaymentUntilStatus<T>(...statuses: PaymentStatusEnum[]): Observable<NodePaymentResponseInterface<T>> {
    this.store.dispatch(new PollPaymentForStatus(statuses));

    return this.store.select(PaymentState.response).pipe(
      filter(response => statuses.includes(response.payment.status)),
    );
  }

  getTerms<T extends PaymentTerms>(connectionId: string): Observable<T> {
    return this.nodeApiService.getTerms<T>(connectionId);
  }
}
