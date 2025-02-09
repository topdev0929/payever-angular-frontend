import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { ProductInterface } from '../types';

import { SantanderDkFlowService } from './santander-dk-flow.service';

const win = window as Window & { [key: string]: any };

@Injectable()
export class ProductsCalculationService {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  private loadingSubject$: BehaviorSubject<number> = new BehaviorSubject(0);
  public isLoading$ = this.loadingSubject$.pipe(map(a => a > 0));

  constructor(private santanderDkFlowService: SantanderDkFlowService) {}

  getProducts(): Observable<ProductInterface[]> {
    const cache = this.getDataFromCache(this.flow.id, this.flow.connectionId, this.flow.total);
    const request$ = cache
    ? of(cache)
    : this.santanderDkFlowService.getCreditProducts<ProductInterface[], { amount: number }>(
      { amount: this.flow.total },
    ).pipe(
      tap(data => this.saveDataToCache(this.flow.id, this.flow.connectionId, this.flow.total, data)),
    );

    return request$;
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show Rates Preview custom element (with price + duration)
  // when we saved only compain code or duration
  // So we have to cache rates request.

  private getDataCacheKey(
    flowId: string,
    flowConnectionId: string,
    flowTotal: number,
  ): string {
    return `checkout_santander_dk_products_${flowId}_${flowConnectionId}_${flowTotal}`;
  }

  private getDataFromCache(flowId: string, connectionId: string, flowTotal: number): ProductInterface[] {
    let data = win[`pe_wrapper_santander_dk_${this.getDataCacheKey(flowId, connectionId, flowTotal)}`];
    try {
      data = JSON.parse(sessionStorage.getItem(this.getDataCacheKey(flowId, connectionId, flowTotal)));
    } catch (e) { }

    return data;
  }

  private saveDataToCache(
    flowId: string,
    connectionId: string,
    flowTotal: number,
    data: ProductInterface[],
  ): void {
    win[`pe_wrapper_santander_dk_${this.getDataCacheKey(flowId, connectionId, flowTotal)}`] = data;
    try {
      sessionStorage.setItem(this.getDataCacheKey(flowId, connectionId, flowTotal), JSON.stringify(data));
    } catch (e) { }
  }
}
