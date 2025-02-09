import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';

import { RateInterface } from '../types';

export interface GetRatesParamsInterface {
  dayOfFirstInstalment: number;
  amount?: number;
  condition?: string;
  cpi?: boolean;
  dateOfBirth?: string;
  profession?: string;
  downPayment?: number;
  weekOfDelivery?: string;
  desiredInstalment?: number;
}

@Injectable()
export class RatesCalculationApiService {

  constructor(
    private nodeFlowService: NodeFlowService,
    protected trackingService: TrackingService
  ) {
  }

  getRates(
    params: GetRatesParamsInterface,
  ): Observable<RateInterface[]> {
    if (!params) {
      return of(null);
    }

    return this.nodeFlowService.getCreditRates(params);
  }
}
