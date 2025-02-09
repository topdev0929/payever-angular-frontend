import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { forEach } from 'lodash-es';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { Product } from '../core.entities';

export interface OriginalProduct {
  images: string[];
  uuid: string;
  title: string;
  hidden: boolean;
  price: number;
  salePrice: number;
  currency: string;
  enabled: boolean;
}

const PRODUCT_FIELDS = `
  images
  imagesUrl
  uuid
  title
  hidden
  price
  salePrice
  currency
  enabled`;

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  constructor(private config: EnvironmentConfigService, private apollo: Apollo) {}

  get productsApi(): string {
    return `${this.config.getConfig().backend.products}/api`;
  }

  fetchProductsByChannelSet(
    businessId: string,
    channelSetId: string,
    filterById: string[] = [],
  ): Observable<OriginalProduct[]> {
    const productsQuery: any = gql`
          query {
          getProductsByChannelSet (
              businessId: "${businessId}",
              orderBy: "createdAt",
              orderDirection: "desc",
              pageNumber: 1,
              paginationLimit: 20,
              ${channelSetId ? `channelSetId: ${channelSetId},` : ''}
              existInChannelSet: true,
              filterById: ${JSON.stringify(filterById)},
              ) {
                  products {
                      ${PRODUCT_FIELDS}
                  }
              }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getProductsByChannelSet.products));
  }

  fetchProductsById(productIds: string[]): Observable<Product[]> {
    if (productIds.length === 0) {
      return of([]);
    }

    const products$: Observable<Product>[] = [];
    forEach(productIds, (id: string) => {
      products$.push(this.fetchProduct(id));
    });

    return combineLatest(...products$);
  }

  fetchProduct(productId: string): Observable<Product> {
    const productQuery: any = gql`
      query getProducts {
        product(uuid: "${productId}") {
          businessUuid
          images
          uuid
          title
          description
          hidden
          price
          salePrice
          sku
          barcode
          variants{id, images, title, description, hidden, price, salePrice, sku, barcode}
        }
      }
    `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productQuery })
      .pipe(
        map((result: ApolloQueryResult<any>) => {
          return result.data.product;
        }),
      );
  }

  fetchProductsByBusiness(businessId: string): Observable<OriginalProduct[]> {
    const productsQuery: any = gql`
          query {
            getProductsByBusiness (
              businessUuid: "${businessId}",
            ) {
                ${PRODUCT_FIELDS}
              }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getProductsByBusiness));
  }

  getProductsCategories(businessId: string): Observable<{ id: string; title: string }[]> {
    const productsQuery: any = gql`
          query {
            getCategories (
              businessUuid: "${businessId}",
            ) {
              id
              title
            }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getCategories));
  }

  fetchProductsByCategories(businessId: string, categories: string[]): Observable<OriginalProduct[]> {
    const productsQuery: any = gql`
          query {
            getProductsByCategories (
              businessUuid: "${businessId}",
              pageNumber: 1,
              paginationLimit: 1000,
              categories: [${categories.map((c: string) => `"${c}"`)}],
            ) {
              products {
                ${PRODUCT_FIELDS}
              }
            }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getProductsByCategories.products));
  }
}
