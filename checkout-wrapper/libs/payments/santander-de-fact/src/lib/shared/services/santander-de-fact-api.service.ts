import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import produce from 'immer';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import { ProductsStateService } from '@pe/checkout/products';
import { SettingsState } from '@pe/checkout/store';
import {
  CartItemExInterface,
  FlowInterface,
  NodePaymentCartItemInterface,
  NodePaymentInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { RateInterface } from '../types';

@Injectable()
export class SantanderFactDeApiService extends AbstractApiService {

  private readonly store = inject(Store);
  private readonly productsStateService = inject(ProductsStateService);

  runPaymentAction<PaymentResponseDetails>(
    action: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<PaymentResponseDetails>,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/${action}`;

    return this.prepareNodePaymentData<PaymentResponseDetails>(
      nodeData,
    ).pipe(
      switchMap(data => this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, data)),
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  calculateRates<T>(
    flow: FlowInterface,
    paymentMethod: PaymentMethodEnum,
    data: T,
  ): Observable<RateInterface[]> {
    const url = `${this.env.thirdParty.payments}/api/connection/${flow.connectionId}/action/calculate-rates`;

    return this.http.post<RateInterface[]>(
      url,
      data,
    ).pipe(
      catchError(err =>
        this.logError(err, flow.id, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorRates)
      ),
    );
  }

  private prepareNodePaymentData<PaymentDetails>(
    dataParam: NodePaymentInterface<PaymentDetails>,
  ): Observable<NodePaymentInterface<PaymentDetails>> {
    const productIds = dataParam.paymentItems.reduce((acc, curr) => {
      if (typeof curr.productId === 'string' && !!curr.productId) {
        acc.push(curr.productId);
      }

      return acc;
    }, []);

    return combineLatest([
      productIds.length ? this.productsStateService.getProductsOnce(productIds) : of([]),
      this.store.select(SettingsState.baseSettings),
    ]).pipe(
      map((results) => {
        const [productsFull, flowSettings] = results;

        const fullCartItems = this.productsStateService.cartItemsToExtended(
          productsFull,
          dataParam.paymentItems.map(p => ({ id: p.productId, productId: p.productId })),
          flowSettings,
        );

        const result = produce(dataParam, (draft) => {
          draft.paymentItems.forEach((item) => {
            // When product doesn't exists on product server (come directly from shop)
            //  it can have uuid and id as null
            const full = fullCartItems.find(c => c.productId
                || c.id
                || c.identifier
                && c.productId === item.productId
                  || c.id === item.productId
                  || c.identifier === item.identifier
            );

            // Sometimes product can be non-existing on product server (come directly from shop)
            if (full && !Object.values(full).every(f => f === undefined)) {
              this.cartItemToNodeItem(full, item);
            }

            const productFull = productsFull.find(c => c.uuid === item.productId || c.id === item.productId);
            if (productFull) {
              item.description = productFull.description;
            }
          });
        });

        return result;
      }),
    );
  }

  private cartItemToNodeItem(cartItem: CartItemExInterface, nodeItem: NodePaymentCartItemInterface): void {
    if (cartItem && nodeItem) {
      nodeItem.identifier = cartItem.identifier;
      nodeItem.name = cartItem.name;
      nodeItem.price = cartItem.price;
      nodeItem.sku = cartItem.sku;
      nodeItem.options = cartItem.options;

      nodeItem.thumbnail = cartItem.image;
      nodeItem.vatRate = cartItem.vat;
      nodeItem.url = cartItem.image;
      nodeItem.priceNet = cartItem.priceNet || (nodeItem.price / (1.0 + nodeItem.vatRate)); // Price without taxes
    }
  }
}
