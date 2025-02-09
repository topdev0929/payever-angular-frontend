import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { Product, ProductItemsResponse } from '../interfaces';

@Injectable()
export class ProductsService {

  constructor(private http: HttpClient,
              private config: ConfigService) {
  }

  fetchStoreCategoryProducts(categoryId: string, filters: {[key: string]: any} = {}): Observable<ProductItemsResponse> {
    const path: string = `${this.config.apiUrl}/stores/api/v1/business/${this.config.businessSlug}/builder/stores/${this.config.storeId}/categories/${categoryId}/items`;
    return this.http.get<ProductItemsResponse>(path, { params: this._getFilterParams(filters) });
  }

  fetchAllStoreProducts(filters: {[key: string]: any} = {}): Observable<ProductItemsResponse> {
    const productsFilters: {[key: string]: any} = { ...filters };
    productsFilters['business'] = this.config.businessSlug;
    productsFilters['store'] = this.config.storeId;
    return this.http.get<ProductItemsResponse>(`${this.config.apiUrl}/products/api/v1/products`, { params: this._getFilterParams(productsFilters) });
  }

  fetchProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.config.apiUrl}/products/api/v1/products/${productId}`);
  }

  private _getFilterParams(filters: {[key: string]: any}): HttpParams {
    let params: HttpParams = new HttpParams();

    for(const key in filters){
      switch (key) {
        case 'search': {
          params = params.append('f[search]', String(filters[key]));
          break;
        }
        default: {
          params = params.append(key, String(filters[key]));
          break;
        }
      }
    }

    params = params.append('withRelations', 'false'); // Improve speed of loading product list
    return params;
  }

}
