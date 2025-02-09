import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PaymentState } from '@pe/checkout/store';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { RateInterface } from '../types';

import { SantanderFactDeApiService } from './santander-de-fact-api.service';

@Injectable()
export class SantanderFactDeFlowService extends BaseNodeFlowService {

  private store = this.injector.get(Store);
  private santanderFactDeApiService = this.injector.get(SantanderFactDeApiService);

  runPaymentAction<PaymentResponseDetails>(action: string):
  Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const payload = this.store.selectSnapshot(PaymentState.paymentPayload);

    return this.santanderFactDeApiService.runPaymentAction(
      action,
      this.paymentMethod,
      this.flow.connectionId,
      payload,
    );
  }

  calculateRates<T>(data: T): Observable<RateInterface[]> {
    return this.santanderFactDeApiService.calculateRates<T>(this.flow, this.paymentMethod, data);
  }
}
