import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface } from '../types';

import { RatesCalculationApiService } from './rates-calculation-api.service';

interface RatesValueInterface {
  subject: BehaviorSubject<RateInterface[]>;
  errorSubject: BehaviorSubject<any>;
  processed: boolean;
}

const win = window as any;

export const clearCache = () => {
  Object.keys(win).forEach((key) => {
    if (key.startsWith('pe_wrapper_santander_se_')) {
      delete win[key];
    }
  });
  sessionStorage.clear();
};

@Injectable()
export class RatesCalculationService {

  isLoading$: Observable<boolean> = null;

  private summaries: {[key: string]: RatesValueInterface} = {};
  private loadingSubject$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private ratesCalcApiService: RatesCalculationApiService
  ) {
    this.isLoading$ = this.loadingSubject$.asObservable().pipe(map((a: number) => a > 0));
  }

  fetchRatesOnce(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    flowTotal: number,
    reset = false,
  ): Observable<RateInterface[]> {
    return new Observable<RateInterface[]>((observer) => {
      let errorSub: Subscription = null;
      this.fetchRates(flowId, paymentMethod, flowTotal, reset).pipe(filter(d => !!d), take(1)).subscribe((value) => {
        if (errorSub) {
          errorSub.unsubscribe();
        }
        observer.next(value);
      });
      errorSub = this.fetchRatesError(flowId, flowTotal).pipe(filter(d => !!d), take(1)).subscribe((err) => {
        observer.error(err);
      });
    });
  }

  fetchRates(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    flowTotal: number,
    reset = false,
  ): Observable<RateInterface[]> {
    const ref: RatesValueInterface = this.initRef(flowId, flowTotal);
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);
      ref.errorSubject.next(null);

      const cache = this.getDataFromCache(flowId, flowTotal);
      this.loadingSubject$.next(this.loadingSubject$.value + 1);
      const call = (cache && !reset) ? of(cache) : this.ratesCalcApiService.getRates(flowId, paymentMethod, flowTotal);
      call.subscribe((data) => {
        this.saveDataToCache(flowId, flowTotal, data);
        ref.subject.next(data);
        this.loadingSubject$.next(this.loadingSubject$.value - 1);
      }, (err) => {
        ref.processed = false;
        ref.errorSubject.next(err);
        this.loadingSubject$.next(this.loadingSubject$.value - 1);
      });
    }

    return ref.subject.asObservable();
  }

  fetchRatesError(flowId: string, flowTotal: number): Observable<any> {
    const ref: RatesValueInterface = this.initRef(flowId, flowTotal);

    return ref.errorSubject.asObservable();
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show rates preview block (price + duration) when we saved only duration
  // So we have to cache.

  private getDataCacheKey(flowId: string, flowTotal: number): string {
    return `checkout_santander_se_rates_${flowId}_${flowTotal}`;
  }

  private getDataFromCache(flowId: string, flowTotal: number): RateInterface[] {
    let data = win[`pe_wrapper_santander_se_${this.getDataCacheKey(flowId, flowTotal)}`];
    try {
      data = JSON.parse(sessionStorage.retrieve(this.getDataCacheKey(flowId, flowTotal)));
    } catch (e) {}

    return data;
  }

  private saveDataToCache(flowId: string, flowTotal: number, data: RateInterface[]): void {
    win[`pe_wrapper_santander_se_${this.getDataCacheKey(flowId, flowTotal)}`] = data;
    try {
      sessionStorage.store(this.getDataCacheKey(flowId, flowTotal), JSON.stringify(data));
    } catch (e) {}
  }

  private initRef(flowId: string, flowTotal: number): RatesValueInterface {
    const name: string = this.getDataCacheKey(flowId, flowTotal);
    if (!this.summaries[name]) {
      this.summaries[name] = {
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject: new BehaviorSubject<any>(null),
        processed: false,
      };
    }

    return this.summaries[name];
  }
}
