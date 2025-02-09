import { Injectable } from '@angular/core';
import { EnvironmentConfigService } from '@pe/ng-kit/src/kit/environment-config/src/services/environment-config.service';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

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

const PRODUCT_FIELDS: string = `
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
  constructor(
    private config: EnvironmentConfigService,
    private apollo: Apollo
  ) {}

  get productsApi(): string {
    return `${this.config.getConfig().backend.products}/api`;
  }

  fetchProductsByChannelSet(
    businessId: string,
    channelSetId: string,
    filterById: string[] = []
  ): Observable<OriginalProduct[]> {
    const ProductsQuery: any = gql`
      query {
        getProductsByChannelSet (
          businessId: "${businessId}",
          orderBy: "createdAt",
          orderDirection: "desc",
          pageNumber: 1,
          paginationLimit: 20,
          ${channelSetId ? `channelSetId: "${channelSetId}",` : ''}
          existInChannelSet: true,
          filterById: ${JSON.stringify(filterById)},
        ) {
            products {
              ${PRODUCT_FIELDS}
            }
          }
      }
    `;

    this.apollo.use('products').getClient().cache.reset();

    return this.apollo.use('products')
      .query({ query: ProductsQuery }).pipe(map(response => response.data['getProductsByChannelSet']['products']));
  }

  fetchProductsByBusiness(
    businessId: string
  ): Observable<OriginalProduct[]> {
      const ProductsQuery: any = gql`
          query {
            getProductsByBusiness (
              businessUuid: "${businessId}",
            ) {
                ${PRODUCT_FIELDS}
              }
          }
      `;

    this.apollo.use('products').getClient().cache.reset();

    return this.apollo.use('products')
      .query({ query: ProductsQuery }).pipe(map(response => response.data['getProductsByBusiness']));
  }

  getProductsCategories(
    businessId: string
  ): Observable<{id: string, title: string}[]> {
      const ProductsQuery: any = gql`
          query {
            getCategories (
              businessUuid: "${businessId}",
            ) {
              id
              title
            }
          }
      `;

    this.apollo.use('products').getClient().cache.reset();

    return this.apollo.use('products')
      .query({ query: ProductsQuery }).pipe(map(response => response.data['getCategories']));
  }

  fetchProductsByCategories(
    businessId: string,
    categories: string[]
  ): Observable<OriginalProduct[]> {
      const ProductsQuery: any = gql`
          query {
            getProductsByCategories (
              businessUuid: "${businessId}",
              pageNumber: 1,
              paginationLimit: 1000,
              categories: [${categories.map(c => `"${c}"`)}],
            ) {
              products {
                ${PRODUCT_FIELDS}
              }
            }
          }
      `;

    this.apollo.use('products').getClient().cache.reset();

    return this.apollo.use('products')
      .query({ query: ProductsQuery }).pipe(map(response => response.data['getProductsByCategories']['products']));
  }
}
