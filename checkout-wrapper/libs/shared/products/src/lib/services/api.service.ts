import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseErrorsInterface } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';


import { ProductInterface } from '../types';

interface ProduceResponseInterface {
  data: {
    getProductsByIdsOrVariantIds: ProductInterface[];
  };
  errors: {
    message: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {

  private http: HttpClient = this.injector.get(HttpClient);
  private env: EnvironmentConfigInterface = this.injector.get(PE_ENV);

  constructor(
    private injector: Injector
  ) {
  }

  getProducts(ids: string[]): Observable<ProductInterface[]> {
    // As AuthInterceptor always adds withCredentials=true and
    // this endpoint doesn't support OPTIONS request we have to use old Http
    return this.http.post<ProduceResponseInterface>(
      `${this.env.backend.products}/products`,
      JSON.stringify({
        query: `
          query getProducts {
            getProductsByIdsOrVariantIds(ids: ["${ids.join('" "')}"]) {
              id
              businessUuid
              images
              currency
              uuid
              title
              description
              onSales
              price
              salePrice
              sku
              barcode
              type
              active
              vatRate
              categories{_id, slug, title}
              channelSets{id, type, name}
              variants{id, images, title, options{_id, name, value}, description, onSales, price, salePrice, sku, barcode}
              shipping{free, general, weight, width, length, height}
            }
          }
      `,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      }
    ).pipe(map((response: ProduceResponseInterface) => {
      if (!this.hasProduct(response)) {
        throw this.makeError(response);
      }

      return response.data.getProductsByIdsOrVariantIds;
    }));
  }

  private hasProduct(response: ProduceResponseInterface): boolean {
    return !!response?.data?.getProductsByIdsOrVariantIds;
  }

  private makeError(response: ProduceResponseInterface): ResponseErrorsInterface {
    const message: string = (response.errors || []).filter(m => !!m?.message).map(m => m.message).join(', ');

    return {
      code: 400,
      errors: null,
      message: message || 'Failed to get product(s)',
      raw: null,
    };
  }
}
