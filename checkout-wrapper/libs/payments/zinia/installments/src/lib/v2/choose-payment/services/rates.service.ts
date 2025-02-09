import { Injectable, inject } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { FlowState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface } from '../models';

import { RatesApiService } from './rates-api.service';

@Injectable({
  providedIn: 'any',
})
export class RatesService {

  private readonly api = inject(RatesApiService);

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod: PaymentMethodEnum;

  private cache: { [key: string]: RateInterface[] } = {};

  getRates(): Observable<RateInterface[]> {
    const key = this.flow.amount.toString();

    return this.cache[key]
      ? of(this.cache[key])
      : this.api.calculateRates(this.flow, this.paymentMethod, {
        amount: String(this.flow.total),
      }).pipe(
        tap((rates) => {
          this.cache[key] = rates;
        }),
      );
  }
}
