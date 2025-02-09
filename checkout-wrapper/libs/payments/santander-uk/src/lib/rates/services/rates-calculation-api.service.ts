import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface } from '../../shared';

@Injectable()
export class RatesCalculationApiService {

  constructor(
    private nodeFlowService: NodeFlowService,
    protected trackingService: TrackingService
  ) {
  }

  getRates(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    total: number,
    deposit: number,
  ): Observable<RateInterface[]> {
    return this.nodeFlowService.getCreditRates(
      { amount: String(total), downPayment: deposit ?? 0 },
    );
  }
}
