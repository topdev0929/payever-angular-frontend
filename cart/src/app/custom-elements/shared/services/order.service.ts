import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { flatMap, catchError, map } from 'rxjs/operators';
import { forEach } from 'lodash-es';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { FlowInterface } from '@pe/checkout-sdk/sdk/types';
import { FlowStorage } from '@pe/checkout-sdk/sdk/storage';

const KEY: string = 'order_reserve_id';

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

  private httpClient: HttpClient = this.injector.get(HttpClient);
  private configService: EnvironmentConfigService = this.injector.get(EnvironmentConfigService);
  private flowStorage: FlowStorage = this.injector.get(FlowStorage);
  private translateService: TranslateService = this.injector.get(TranslateService);

  constructor(
    private injector: Injector
  ) {
  }

  updateOrder(flow: FlowInterface): Observable<void> {
    const orderId: string = this.flowStorage.getData('order_reserve', KEY) || this.flowStorage.getData(flow.id, KEY);
    return (
        orderId ? this.getOrder(orderId, flow.business_id).pipe(catchError(() => of(null))) : of(null as OrderReserveInterface)
    ).pipe(flatMap((existingOrder: OrderReserveInterface) => {
      const request = existingOrder && existingOrder.status === OrderReserveStatusEnum.TEMPORARY ?
        this.patchOrder(orderId, flow) :
        this.postOrder(flow);
      return request.pipe(catchError((err: any) => {
        if (err && err.code === 409) {
          const failedItems: string[] = [];
          if (err.message && err.message.failedItems && err.message.failedItems.length) {
            forEach(err.message.failedItems, item => {
              failedItems.push(item.uuid || item.id || item._id);
            });
          }
          err.failedItems = failedItems;
          err.message = this.translateService.translate('checkout_cart_edit.error.products_not_available');
        }
        return throwError(err);
      }), map(order => {
        this.flowStorage.setData('order_reserve', KEY, order._id);
        this.flowStorage.setData(flow.id, KEY, order._id);
        return null;
      }));
    }));
  }

  private postOrder(flow: FlowInterface): Observable<OrderReserveInterface> {
    return this.httpClient.post<OrderReserveInterface>( `${this.configService.getBackendConfig().inventory}/api/business/${flow.business_id}/order`, flow);
  }

  private patchOrder(orderId: string, flow: FlowInterface): Observable<OrderReserveInterface> {
    return this.httpClient.patch<OrderReserveInterface>( `${this.configService.getBackendConfig().inventory}/api/business/${flow.business_id}/order/${orderId}`, flow);
  }

  private getOrder(orderId: string, businessId: string): Observable<OrderReserveInterface> {
    return this.httpClient.get<OrderReserveInterface>( `${this.configService.getBackendConfig().inventory}/api/business/${businessId}/order/${orderId}`);
  }
}
