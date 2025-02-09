import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import { ShippingAddressInterface, ShippingResponseInterface, ShippingCartProduct } from '../types';

@Injectable()
export class ShippingApiService {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private httpClient: HttpClient
  ) {
  }

  attachShipping(channelSetId: string, shippingOrderId: string, integrationSubscriptionId: string): Observable<object> {
    return this.httpClient.post<object>(`${this.env.backend.shipping}/api/channel-set/${channelSetId}/shipping/select-method`, {
      shippingOrderId,
      integrationSubscriptionId,
    });
  }

  requestShippingData(
    channelSetId: string,
    address: ShippingAddressInterface,
    products: ShippingCartProduct[],
  ): Observable<ShippingResponseInterface> {
    return this.httpClient.post<ShippingResponseInterface>(
      `${this.env.backend.shipping}/api/channel-set/${channelSetId}/shipping/methods`,
      {
        shippingAddress: address,
        shippingItems: products,
      }
    );
  }
}
