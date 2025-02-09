import { Injectable, Injector } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { RateInterface } from '../types';

import { GetRatesParamsInterface, RatesCalculationApiService } from './rates-calculation-api.service';

interface RatesValueInterface {
  subject: BehaviorSubject<RateInterface[]>;
  errorSubject: BehaviorSubject<any>;
  processed: boolean;
}

const win = window as any;

@Injectable()
export class RatesCalculationService {

  isLoading$: Observable<boolean> = null;

  private summaries: {[key: string]: RatesValueInterface} = {};
  private loadingSubject$: BehaviorSubject<number> = new BehaviorSubject(0);

  private ratesCalcApiService: RatesCalculationApiService = this.injector.get(RatesCalculationApiService);

  constructor(
    private injector: Injector
  ) {
    this.isLoading$ = this.loadingSubject$.asObservable().pipe(map((a: number) => a > 0));
  }

  fetchRates(
    flowId: string,
    params: GetRatesParamsInterface,
  ): Observable<RateInterface[]> {
    const cache = this.getDataFromCache(flowId, params);

    return cache
      ? of(cache)
      : this.ratesCalcApiService.getRates(params).pipe(
        tap((data) => {
          this.saveDataToCache(flowId, params, data);
        }),
      );
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show rates preview block (price + duration) when we saved only duration
  // So we have to cache.

  private getDataCacheKey(flowId: string, params: GetRatesParamsInterface): string {
    return `pe_checkout_wrapper_santander_de_pos_rates_${flowId}_${Object.values(params || {}).join('_')}`;
  }

  private getDataFromCache(flowId: string, params: GetRatesParamsInterface): RateInterface[] {
    const key = this.getDataCacheKey(flowId, params);
    let data = win[key];
    try {
      data = JSON.parse(sessionStorage.retrieve(key));
    } catch (e) {}

    return data;
  }

  private saveDataToCache(flowId: string, params: GetRatesParamsInterface, data: RateInterface[]): void {
    const key = this.getDataCacheKey(flowId, params);
    win[key] = data;
    try {
      sessionStorage.store(key, JSON.stringify(data));
    } catch (e) {}
  }
}
