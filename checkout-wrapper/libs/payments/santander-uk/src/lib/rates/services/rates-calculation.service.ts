import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface } from '../../shared';

import { RatesCalculationApiService } from './rates-calculation-api.service';

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

  constructor(
    private ratesCalcApiService: RatesCalculationApiService
  ) {
    this.isLoading$ = this.loadingSubject$.asObservable().pipe(map((a: number) => a > 0));
  }

  fetchRatesOnce(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    flowTotal: number,
    deposit: number,
    reset = false,
  ): Observable<RateInterface[]> {
    return new Observable<RateInterface[]>((observer) => {
      let errorSub: Subscription = null;
      this.fetchRates(
        flowId,
        paymentMethod,
        flowTotal,
        deposit,
        reset,
      ).pipe(filter(d => !!d), take(1)).subscribe((value) => {
        if (errorSub) {
          errorSub.unsubscribe();
        }
        observer.next(value);
      });
      errorSub = this.fetchRatesError(flowId, flowTotal, deposit).pipe(filter(d => !!d), take(1)).subscribe((err) => {
        observer.error(err);
      });
    });
  }

  fetchRates(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    flowTotal: number,
    deposit: number,
    reset = false,
  ): Observable<RateInterface[]> {
    const ref: RatesValueInterface = this.initRef(flowId, flowTotal, deposit);
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);
      ref.errorSubject.next(null);

      const cache = this.getDataFromCache(flowId, flowTotal, deposit);
      this.loadingSubject$.next(this.loadingSubject$.value + 1);
      const call = cache ? of(cache) : this.ratesCalcApiService.getRates(flowId, paymentMethod, flowTotal, deposit);
      call.subscribe((data) => {
        this.saveDataToCache(flowId, flowTotal, deposit, data);
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

  fetchRatesError(flowId: string, flowTotal: number, deposit: number): Observable<any> {
    const ref: RatesValueInterface = this.initRef(flowId, flowTotal, deposit);

    return ref.errorSubject.asObservable();
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show rates preview block (price + duration) when we saved only duration
  // So we have to cache.

  private getDataCacheKey(flowId: string, flowTotal: number, deposit: number): string {
    return `pe_checkout_wrapper_santander_uk_rates_${flowId}_${flowTotal}_${deposit}`;
  }

  private getDataFromCache(flowId: string, flowTotal: number, deposit: number): RateInterface[] {
    const key = this.getDataCacheKey(flowId, flowTotal, deposit);
    let data = win[key];
    try {
      data = JSON.parse(sessionStorage.retrieve(key));
    } catch (e) {}

    return data;
  }

  private saveDataToCache(flowId: string, flowTotal: number, deposit: number, data: RateInterface[]): void {
    const key = this.getDataCacheKey(flowId, flowTotal, deposit);
    win[key] = data;
    try {
      sessionStorage.store(key, JSON.stringify(data));
    } catch (e) {}
  }

  private initRef(flowId: string, flowTotal: number, deposit: number): RatesValueInterface {
    const key: string = this.getDataCacheKey(flowId, flowTotal, deposit);
    if (!this.summaries[key]) {
      this.summaries[key] = {
        subject: new BehaviorSubject<RateInterface[]>(null),
        errorSubject: new BehaviorSubject<any>(null),
        processed: false,
      };
    }

    return this.summaries[key];
  }
}
