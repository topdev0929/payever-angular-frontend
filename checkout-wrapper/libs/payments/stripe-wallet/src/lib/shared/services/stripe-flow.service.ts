import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PaymentState } from '@pe/checkout/store';
import { NodePaymentInterface, NodePaymentPreInitializeData } from '@pe/checkout/types';

import { PaymentIntentResponse, NodePaymentDetailsInterface } from '../types';

import { StripeApiService } from './stripe-api.service';

@Injectable({
  providedIn: 'root',
})
export class StripeFlowService extends BaseNodeFlowService {

  @SelectSnapshot(PaymentState.paymentPayload)
  private paymentPayload: NodePaymentInterface<NodePaymentDetailsInterface>;

  private stripeApiService = this.injector.get(StripeApiService);

  private postPaymentSubject$ = new ReplaySubject<boolean>(1);
  postPayment$ = this.postPaymentSubject$.asObservable();

  public readonly confirmCardPayment$ = new BehaviorSubject<PaymentIntentResponse>(null);

  getStripeData(): Observable<NodePaymentPreInitializeData> {
    return this.stripeApiService.paymentPreInitialize(
      this.paymentMethod,
      this.flow.connectionId,
      this.paymentPayload,
    );
  }

  postPayment(state: boolean): void {
    this.postPaymentSubject$.next(state);
  }
}
