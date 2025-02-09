import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { RateInterface } from '../../shared';

import { RatesCalculationApiService } from './rates-calculation-api.service';

const win = window as Window & { [key: string]: any };

@Injectable()
export class RatesCalculationService {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;


  private loadingSubject$: BehaviorSubject<number> = new BehaviorSubject(0);
  public isLoading$ = this.loadingSubject$.pipe(map(a => a > 0));

  constructor(private ratesCalcApiService: RatesCalculationApiService) {}

  getRates(
    productId: string,
  ): Observable<RateInterface[]> {
      const cache = this.getDataFromCache(productId);
      const request$ = cache
        ? of(cache)
        : this.ratesCalcApiService.getRates(this.flow.total, productId).pipe(
            tap(data => this.saveDataToCache(productId, data)),
          );

    return request$;
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show Rates Preview custom element (with price + duration)
  // when we saved only compain code or duration
  // So we have to cache rates request.

  private getDataCacheKey(productId: string): string {
    return `checkout_santander_dk_rates_${this.flow.id}_${this.flow.total}_${productId}`;
  }

  private getDataFromCache(productId: string): RateInterface[] {
    let data = win[`pe_wrapper_santander_dk_${this.getDataCacheKey(productId)}`];
    try {
      data = JSON.parse(sessionStorage.getItem(this.getDataCacheKey(productId)));
    } catch (e) {}

    return data;
  }

  private saveDataToCache(productId: string, data: RateInterface[]): void {
    win[`pe_wrapper_santander_dk_${this.getDataCacheKey(productId)}`] = data;
    try {
      sessionStorage.setItem(this.getDataCacheKey(productId), JSON.stringify(data));
    } catch (e) {}
  }
}
