import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import { FlowInterface, PaymentMethodEnum, RateInterface } from '@pe/checkout/types';

import { CalculateRatesDto } from '../models';

@Injectable({
  providedIn: 'any',
})
export class RatesApiService extends AbstractApiService {

  public calculateRates(
    flow: FlowInterface,
    paymentMethod: PaymentMethodEnum,
    data: CalculateRatesDto,
  ) {
    const url = `${this.env.thirdParty.payments}/api/connection/${flow.connectionId}/action/calculate-rates`;

    return this.http.post<RateInterface[]>(
      url,
      data,
    ).pipe(
      catchError(err =>
        this.logError(
          err,
          flow.id,
          paymentMethod,
          { url, method: 'POST' },
          ApiErrorType.ErrorRates,
        ),
      ),
    );
  }
}
