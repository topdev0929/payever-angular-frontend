import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap, map, withLatestFrom } from 'rxjs/operators';

import { ProductsStateService, ProductInterface, ProductVariantInterface } from '@pe/checkout/products';
import { FlowState, PatchFlow } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { OrderInterface } from '../types';

import { OrderInventoryService } from './order.service';

@Injectable()
export class StateService {

  private productsStateService: ProductsStateService = this.injector.get(ProductsStateService);
  private orderInventoryService: OrderInventoryService = this.injector.get(OrderInventoryService);
  private store = this.injector.get(Store);

  constructor(
    private injector: Injector
  ) {
  }

  patchFlow(
    flowData: FlowInterface,
    updateOrderReserve = false,
  ): Observable<FlowInterface> {
    return this.store.dispatch(new PatchFlow({ ...flowData })).pipe(
      withLatestFrom(this.store.select(FlowState.flow)),
      mergeMap(([, flow]) => updateOrderReserve
        ? this.orderInventoryService.updateOrder(flow).pipe(map(() => flow))
        : of(flow)
      ),
      catchError(error => throwError(error))
    );
  }

  getProductsOnce(uuids: string[], reset = false): Observable<ProductInterface[]> {
    return this.productsStateService.getProductsOnce(uuids, reset);
  }

  makeVariantTitle(variant: ProductVariantInterface): string {
    return this.productsStateService.makeVariantTitle(variant);
  }

  flowToOrderInfo(flowData: FlowInterface): OrderInterface {
    const orderData: OrderInterface = {};

    orderData.hasCartItems = Boolean(flowData.cart) && flowData.cart.length > 0;
    let subtotalOriginal: number = flowData.amount;
    let subtotalWithDiscount: number = flowData.amount;
    if (orderData.hasCartItems) {
      subtotalOriginal = flowData.cart.reduce((total, item) =>
        total += item.quantity * (item.originalPrice ?? item.price),
        0);
      subtotalWithDiscount = flowData.cart.reduce((total, item) =>
        total += item.quantity * (item.price ?? item.originalPrice),
        0);
    }
    orderData.subtotalOriginal = subtotalOriginal;
    orderData.subtotalWithDiscount = subtotalWithDiscount;
    orderData.discount = subtotalOriginal - subtotalWithDiscount;

    // In the previous version of the API, the taxValue field was always returned. And default taxValue = 0;
    orderData.taxValue = orderData.subtotalWithDiscount * (flowData.taxValue ?? 0);

    orderData.orderTotal = orderData.hasCartItems
      ? orderData.subtotalWithDiscount + orderData.taxValue
      : flowData.total;

    orderData.isPosOrder = !orderData.hasCartItems && flowData.total === orderData.orderTotal;

    return orderData;
  }
}
