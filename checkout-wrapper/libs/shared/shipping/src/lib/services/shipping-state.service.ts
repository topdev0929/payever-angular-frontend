import { Injectable } from '@angular/core';
import { MD5 } from 'object-hash';
import { BehaviorSubject, Observable, Observer, Subscription, of } from 'rxjs';
import { catchError, filter, mergeMap, map, take } from 'rxjs/operators';

import { ApiService as SdkApiService } from '@pe/checkout/api';
import { ProductsStateService, ProductInterface } from '@pe/checkout/products';
import { FlowInterface, CartItemInterface } from '@pe/checkout/types';

import {
  ShippingOptionSaveDataInterface,
  NormilizedShippingInterface,
} from '../types';

import { ShippingApiService } from './shipping-api.service';
import { ShippingConverterService } from './shipping-converter.service';

@Injectable()
export class ShippingStateService {

  // Note: Why we don't use SessionStorageService from ngx-webstorage?
  // Because both custom elements (edit and view) has own copy of StateService.
  // As result it will be 2 copies of SessionStorageService
  // And as SessionStorageService uses internal cache for access data - we will get double requests.

  private lastError: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private shippingsCache: {
    [key: string]: {
      subject?: BehaviorSubject<NormilizedShippingInterface[]>;
      processed?: boolean
    }
  } = {};

  constructor(
    private apiService: ShippingApiService,
    private converterService: ShippingConverterService,
    private sdkApiService: SdkApiService,
    private productsStateService: ProductsStateService
  ) {
  }

  getShippings(flow: FlowInterface, resetCache = false): Observable<NormilizedShippingInterface[]> {
    const hash: string = this.makeHash(flow.id, flow.cart, flow.amount, flow.currency, flow.billingAddress);
    if (!this.shippingsCache[hash]) {
      this.shippingsCache[hash] = {
        subject: new BehaviorSubject(null),
      };
    }
    const data = this.shippingsCache[hash];
    if (!data.processed || resetCache) {
      data.processed = true;
      data.subject.next(null);
      this.lastError.next(null);

      const cache = this.getDataFromCache(hash);
      const call = cache ? of(cache) : this.getShippingsData(flow);

      call.pipe(
        catchError((err) => {
          this.lastError.next(err);

          return [];
        })
      ).subscribe((ret) => {
        data.subject.next(ret);
        this.saveDataToCache(hash, ret);
      });
    }

    return data.subject.asObservable();
  }

  getShippingsOnce(flow: FlowInterface, resetCache = false): Observable<NormilizedShippingInterface[]> {
    return new Observable((observer: Observer<NormilizedShippingInterface[]>) => {
      let errorSub: Subscription = null;
      this.getShippings(flow, resetCache).pipe(filter(d => !!d), take(1)).subscribe((value) => {
        if (errorSub) {
          errorSub.unsubscribe();
        }
        observer.next(value);
      });
      errorSub = this.lastError.pipe(filter(d => !!d), take(1)).subscribe((err) => {
        observer.error(err);
      });
    });
  }

  saveShipping(
    channelSetId: string,
    shippingOrderId: string,
    integrationSubscriptionId: string,
    flowId: string,
    saveData: ShippingOptionSaveDataInterface
  ): Observable<FlowInterface> {
    return this.apiService.attachShipping(channelSetId, shippingOrderId, integrationSubscriptionId).pipe(
      mergeMap(() => this.sdkApiService._patchFlow(flowId, { ...saveData, shippingOrderId: shippingOrderId } as any))
    );
  }

  private getShippingsData(flow: FlowInterface): Observable<NormilizedShippingInterface[]> {
    let products$: Observable<ProductInterface[]> = of([]);
    if (flow.cart?.length) {
      products$ = this.productsStateService.getProductsOnce(this.converterService.getCartItemIdsFromFlow(flow));
    }

    return products$.pipe(
      mergeMap((products: ProductInterface[]) =>
        this.apiService.requestShippingData(
          flow.channelSetId,
          this.converterService.convertFlowAddressToShippingAddress(flow.billingAddress),
          this.converterService.convertFlowCartToShippingProducts(flow, products)
        ).pipe(
          map(data => this.converterService.convertShippingToNormilized(data, flow.currency)),
        )
      ),
    );
  }

  private makeHash(
    flowId: string,
    cart: CartItemInterface[],
    amount: number,
    currency: string,
    billingAddress: any,
  ): string {
    return MD5(JSON.stringify({ flowId, cart, amount, currency, billingAddress }));
  }

  private getDataFromCache(hash: string): NormilizedShippingInterface[] {
    const ret = sessionStorage.getItem(`pe_checkout_shipping_${hash}`);

    return ret ? JSON.parse(ret) : null;
  }

  private saveDataToCache(hash: string, data: NormilizedShippingInterface[]): void {
    sessionStorage.setItem(`pe_checkout_shipping_${hash}`, JSON.stringify(data));
  }
}
