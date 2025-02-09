import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface } from '../types';

@Injectable()
export class RatesCalculationApiService {

  constructor(
    private nodeFlowService: NodeFlowService,
    protected trackingService: TrackingService,
  ) {}

  getRates(flowId: string, paymentMethod: PaymentMethodEnum, total: number): Observable<RateInterface[]> {
    return this.nodeFlowService.getCreditRates<RateInterface[], { amount: string }>(
      { amount: String(total) },
    );
  }
}
