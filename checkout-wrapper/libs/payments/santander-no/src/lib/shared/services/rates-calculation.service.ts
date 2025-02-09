import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  ProductTypeEnum,
  RateInterface,
} from '../../shared';

import { RatesCalculationApiService } from './rates-calculation-api.service';

interface SummaryValueInterface {
  subject: BehaviorSubject<RateInterface[]>;
  errorSubject: BehaviorSubject<any>;
  processed: boolean;
}

const win = window as any;

@Injectable()
export class RatesCalculationService {

  isLoading$: Observable<boolean> = null;

  private summaries: { [key: string]: SummaryValueInterface } = {};
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
    productType: ProductTypeEnum,
    reset = false,
  ): Observable<RateInterface[]> {
    return new Observable<RateInterface[]>((observer) => {
      let errorSub: Subscription = null;
      this.fetchRates(flowId, paymentMethod, flowTotal, productType, reset).pipe(
        filter(d => !!d),
        take(1),
      ).subscribe((value) => {
        if (errorSub) {
          errorSub.unsubscribe();
        }
        observer.next(value);
      });
      errorSub = this.fetchRatesError(flowId, flowTotal, productType).pipe(
        filter(d => !!d),
        take(1),
      ).subscribe((err) => {
        observer.error(err);
      });
    });
  }

  fetchRates(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    flowTotal: number,
    productType: ProductTypeEnum,
    reset = false,
  ): Observable<RateInterface[]> {
    const ref: SummaryValueInterface = this.initRef(flowId, flowTotal, productType);
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);
      ref.errorSubject.next(null);

      const cache = this.getDataFromCache(flowId, flowTotal, productType);
      this.loadingSubject$.next(this.loadingSubject$.value + 1);
      const call = cache ? of(cache) : this.ratesCalcApiService.getRates(flowId, paymentMethod, flowTotal);
      call.subscribe((data) => {
        this.saveDataToCache(flowId, flowTotal, productType, data);
        ref.subject.next(data);
        this.loadingSubject$.next(this.loadingSubject$.value - 1);
      }, (err) => {
        ref.processed = false;
        ref.errorSubject.next(err);
        this.loadingSubject$.next(this.loadingSubject$.value - 1);
      });
    }

    return ref.subject.asObservable().pipe(map(rates =>
      // Here we can filter by productType, bot not needed now
       rates
    ));
  }

  fetchRatesError(flowId: string, flowTotal: number, productType: ProductTypeEnum): Observable<any> {
    const ref: SummaryValueInterface = this.initRef(flowId, flowTotal, productType);

    return ref.errorSubject.asObservable();
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show Rates Preview custom element (with price + duration)
  // when we saved only compain code or duration
  // So we have to cache rates request.

  private getDataCacheKey(flowId: string, flowTotal: number, productType: ProductTypeEnum): string {
    return `checkout_santander_no_rates_${flowId}_${flowTotal}_${productType}`;
  }

  private getDataFromCache(flowId: string, flowTotal: number, productType: ProductTypeEnum): RateInterface[] {
    let data: RateInterface[] = win[`pe_wrapper_santander_no_${this.getDataCacheKey(flowId, flowTotal, productType)}`];
    try {
      data = JSON.parse(sessionStorage.getItem(this.getDataCacheKey(flowId, flowTotal, productType)));
    } catch (e) { }

    return data;
  }

  private saveDataToCache(
    flowId: string,
    flowTotal: number,
    productType: ProductTypeEnum,
    data: RateInterface[],
  ): void {
    win[`pe_wrapper_santander_no_${this.getDataCacheKey(flowId, flowTotal, productType)}`] = data;
    try {
      sessionStorage.setItem(this.getDataCacheKey(flowId, flowTotal, productType), JSON.stringify(data));
    } catch (e) { }
  }

  private initRef(flowId: string, flowTotal: number, productType: ProductTypeEnum): SummaryValueInterface {
    const name: string = this.getDataCacheKey(flowId, flowTotal, productType);
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
