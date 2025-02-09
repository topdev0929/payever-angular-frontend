import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SelectOptionInterface } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { CategoriesInterface } from '../types';

import { ProductsStorageService } from './products-storage.service';

@Injectable()
export class ProductsApiService {

  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private productsStorageService: ProductsStorageService,
  ) {}

  getCategories(
    connectionId: string,
    isEnableLoadCategory: boolean,
    flowId: string
  ): Observable<SelectOptionInterface[]> {
    if (!isEnableLoadCategory) {
      const categories = this.productsStorageService.getTemporaryCategories(flowId);

      return of(categories);
    }

    return this.httpClient.post<CategoriesInterface[]>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-items`,
      {}
    ).pipe(
      map((categories: CategoriesInterface[]) => {
        const categoriesData = categories.map(({ itemDescription, itemId }: CategoriesInterface) => ({
          label: itemDescription,
          value: itemId,
        }));

        this.productsStorageService.setTemporaryCategories(flowId, categoriesData);

        return categoriesData;
      }),
    );
  }
}
