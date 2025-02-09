import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  RateInterface,
} from '../../shared';

@Injectable()
export class RatesCalculationApiService {

  constructor(
    private nodeFlowService: NodeFlowService,
  ) {
  }

  getRates(flowId: string, paymentMethod: PaymentMethodEnum, total: number): Observable<RateInterface[]> {
    //  // We call it in root container component
    return this.nodeFlowService.getCreditRates<RateInterface[], { amount: string }>(
      { amount: String(total) },
    );
  }
}
