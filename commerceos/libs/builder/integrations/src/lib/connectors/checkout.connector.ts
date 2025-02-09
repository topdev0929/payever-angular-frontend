import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PebAPIDataSourceSchema, PebIntegrationAction } from '@pe/builder/core';

import { PebIntegrationAppNamesEnum, CheckoutDefaultCartInfo, CheckoutCartInfoDataSource } from '../constants';

import { PebBaseAppConnector } from './base-app.connector';

@Injectable()
export class PebCheckoutConnector extends PebBaseAppConnector {
  id = 'checkout-app';
  title = 'payever Checkout';

  protected app = PebIntegrationAppNamesEnum.Checkout;

  private mockActionResponse: PebIntegrationAction[] = [ // TODO: this data will be received from BE
    {
      id: 'checkout.add-to-cart',
      connectorId: this.id,
      title: 'Add product',
      method: 'checkout.update-cart',
      uniqueTag: 'checkout.open-checkout',
      dynamicParams: {
        product: {
          image: 'value.imageUrl',
          name: 'value.title',
          id: 'value.id',
          price: 'value.price',
          priceNet: 'value.priceNet',
        },
        variant: 'value.selectedVariant',
      },
      onSuccess: {
        id: 'add-product-success',
        connectorId: this.id,
        title: 'success message',
        method: 'shared.snackbar.toggle',
        staticParams: {
          content: 'Product added to cart',
          hideButtonTitle: 'hide',
          duration: 2000,
          useShowButton: false,
        },
      },
    },
    {
      id: 'checkout.open-cart',
      title: 'Open Cart',
      connectorId: this.id,
      method: 'checkout.set-checkout-type',
      staticParams: { type: 'checkoutWrapper' },
      onSuccess: {
        id: '2-1',
        connectorId: this.id,
        title: 'Done message',
        method: 'mock.log',
        staticParams: { message: 'DONE' },
      },
    },
  ]

  getActions(): Observable<PebIntegrationAction[]> {
    return of(this.mockActionResponse);
  }

  getDataSources(): Observable<PebAPIDataSourceSchema[]> {
    return of(CheckoutCartInfoDataSource.map(data=>({ ...data, connectorId: this.id })));
  }

  getData(dataSourceId: string, params: any): Observable<any> {
    return of(CheckoutDefaultCartInfo);
  }
}
