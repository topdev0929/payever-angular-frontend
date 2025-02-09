import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap, catchError, map } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { FlowInterface } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';

const KEY = 'order_reserve_id';

enum OrderReserveStatusEnum {
  TEMPORARY = 'TEMPORARY',
  PERMANENT = 'PERMANENT',
  CLOSED = 'CLOSED',
  AUTO_CLOSED = 'AUTO_CLOSED',
}

interface OrderReserveInterface {
  _id: string;
  flow: string;
  reservations: any[]; // TODO Type
  status: OrderReserveStatusEnum;
}

@Injectable()
export class OrderInventoryService {

  // Why we have to store order reserve id at 2 places?
  // Usually 'order_reserve' as flow id is enough. But also we have send flow to device functionality
  // In this case data at 'order_reserve' is lost so we take it from flow data that we can have after sending to device

  private httpClient = this.injector.get(HttpClient);
  private env = this.injector.get(PE_ENV);
  private flowStorage = this.injector.get(FlowStorage);

  constructor(
    private injector: Injector
  ) {
  }

  updateOrder(flow: FlowInterface): Observable<void> {
    const orderId: string = this.flowStorage.getData('order_reserve', KEY) || this.flowStorage.getData(flow.id, KEY);
    const payload = this.mapToPayload(flow);

    return (
      orderId
        ? this.getOrder(orderId, flow.businessId).pipe(catchError(() => of(null)))
        : of(null as OrderReserveInterface)
    ).pipe(mergeMap((existingOrder: OrderReserveInterface) => {
      const request = existingOrder && existingOrder.status === OrderReserveStatusEnum.TEMPORARY
        ? this.patchOrder(orderId, payload)
        : this.postOrder(payload);

      return request.pipe(
        catchError((err: any) => {
          if (err && err.code === 409) {
            const failedItems: string[] = [];
            if (err.message?.failedItems?.length) {
              Object.values(err.message.failedItems).forEach((item: any) => {
                failedItems.push(item.uuid || item.id || item._id);
              });
            }
            err.failedItems = failedItems;
            err.message = $localize `:@@checkout_cart_edit.error.products_not_available:`;
          }

          return throwError(err);
        }),
        map((order) => {
          this.flowStorage.setData('order_reserve', KEY, order._id);
          this.flowStorage.setData(flow.id, KEY, order._id);

          return null;
        })
      );
    }));
  }

  private mapToPayload(flow: FlowInterface): FlowInterface {
    return {
      ...flow,
      cart: flow.cart.map(cart => ({ ...cart, id: cart.productId })),
    };
  }

  private postOrder(flow: FlowInterface): Observable<OrderReserveInterface> {
    return this.httpClient.post<OrderReserveInterface>(
      `${this.env.backend.inventory}/api/business/${flow.businessId}/order`, flow
    );
  }

  private patchOrder(orderId: string, flow: FlowInterface): Observable<OrderReserveInterface> {
    return this.httpClient.patch<OrderReserveInterface>(
      `${this.env.backend.inventory}/api/business/${flow.businessId}/order/${orderId}`, flow
    );
  }

  private getOrder(orderId: string, businessId: string): Observable<OrderReserveInterface> {
    return this.httpClient.get<OrderReserveInterface>(
      `${this.env.backend.inventory}/api/business/${businessId}/order/${orderId}`
    );
  }
}
