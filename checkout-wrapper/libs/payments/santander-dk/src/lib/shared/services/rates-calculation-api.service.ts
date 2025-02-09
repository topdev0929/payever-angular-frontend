import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';

import { RateInterface } from '../../shared';

@Injectable()
export class RatesCalculationApiService {

  constructor(private nodeFlowService: NodeFlowService) {}

  getRates(
    total: number,
    productId: string,
  ): Observable<RateInterface[]> {
    return this.nodeFlowService.getCreditRates<RateInterface[], { amount: number, productId: string }>(
      { amount: total, productId: productId },
    );
  }
}
