import { Injectable, Injector } from '@angular/core';

import { FlowStorage } from '@pe/checkout/storage';
import { SelectOptionInterface } from '@pe/checkout/types';

const CATEGORIES_STORAGE = 'productCategories';

@Injectable()
export class ProductsStorageService {

  private flowStorage: FlowStorage = this.injector.get(FlowStorage);

  constructor(
    private injector: Injector
  ) {}

  getTemporaryCategories(flowId: string): SelectOptionInterface[] {
    return this.flowStorage.getData(flowId, CATEGORIES_STORAGE) || [];
  }

  setTemporaryCategories(flowId: string, address: SelectOptionInterface[]): void {
    this.flowStorage.setData(flowId, CATEGORIES_STORAGE, address);
  }
}
