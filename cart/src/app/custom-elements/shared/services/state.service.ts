import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, flatMap, map, filter, take } from 'rxjs/operators';

import { CartItemInterface, FlowInterface } from '@pe/checkout-sdk/sdk/types';
import { ApiService as SdkApiService, FlowStateService } from '@pe/checkout-sdk/sdk/api';
import { StateService as ProductsStateService, ProductInterface, ProductVariantInterface } from '@pe/checkout-sdk/sdk/products';

import { OrderInterface } from '../types';
import { OrderInventoryService } from './order.service';

@Injectable()
export class StateService {

  private productsStateService: ProductsStateService = this.injector.get(ProductsStateService);
  private orderInventoryService: OrderInventoryService = this.injector.get(OrderInventoryService);
  // private sdkApiService: SdkApiService = this.injector.get(SdkApiService);
  private flowStateService: FlowStateService = this.injector.get(FlowStateService);

  constructor(
    private injector: Injector
  ) {
  }

  patchFlow(flowId: string, flow: FlowInterface, updateOrderReserve: boolean = false): Observable<FlowInterface> {
    return this.flowStateService.patchFlow(flowId, flow).pipe(
      flatMap((flow: FlowInterface) => {
        return updateOrderReserve ?
          this.orderInventoryService.updateOrder(flow).pipe(map(() => flow)) :
          of(flow);
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getProductsOnce(uuids: string[], reset: boolean = false): Observable<ProductInterface[]> {
    return this.productsStateService.getProductsOnce(uuids, reset);
  }

  makeVariantTitle(variant: ProductVariantInterface): string {
    return this.productsStateService.makeVariantTitle(variant);
  }

  flowToOrderInfo(flowData: FlowInterface): OrderInterface {
    const orderData: OrderInterface = {};

    orderData.hasCartItems = Boolean(flowData.cart) && flowData.cart.length > 0;
    let subtotal: number = flowData.amount;
    if ( orderData.hasCartItems ) {
      subtotal = 0;
      flowData.cart.forEach((item: CartItemInterface) => subtotal += item.quantity * item.price);
    }
    orderData.subtotal = subtotal;

    orderData.taxValue = orderData.subtotal * flowData.tax_value;
    orderData.shippingPrice = flowData.shipping_fee || 0;

    orderData.orderTotal = orderData.hasCartItems ? orderData.subtotal + orderData.taxValue + orderData.shippingPrice : flowData.total;

    orderData.isPosOrder = !orderData.hasCartItems && flowData.total === orderData.orderTotal;

    return orderData;
  }
}
