import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PatchFlow } from '@pe/checkout/store';
import { CartItemInterface, FlowInterface } from '@pe/checkout/types';

import { ProductFormInterface } from '../types';

@Injectable()
export class ProductsService {

  constructor(private store: Store) {}

  mapToCart(products: ProductFormInterface[]): CartItemInterface[] {
    return products.map(product => ({
      productId: product.productId,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      extraData: {
        category: product.category,
      },
    }));
  }

  patchFlow(products: ProductFormInterface[]): Observable<void> {
    const amount = products.reduce((acc, item) => acc += item.quantity * item.price, 0);
    const data: FlowInterface = {
      cart: products,
      amount,
    };

    return this.store.dispatch(new PatchFlow({ ...data }));
  }
}
