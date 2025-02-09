import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ngx-webstorage';
import { BehaviorSubject } from 'rxjs';

import { CartEventInterface, CartItemInterface } from '../interfaces';

const CART_ITEMS_KEY = 'cart-items';

export class NewCartService {
  itemsEvent$: BehaviorSubject<CartEventInterface> = new BehaviorSubject<CartEventInterface>({
    items: [],
    sendEvent: false,
  });
  items: CartItemInterface[] = [];

  storageKey: string;

  constructor(
    // private sessionStorageService: SessionStorageService,
  ) {}

  addToCart(item: CartItemInterface): void {
    if (!item.extra_data) {
      item.extra_data = {};
    }

    item.extra_data.updated_at = new Date().getTime();

    const index: number = this.items.findIndex((cartItem: CartItemInterface) => item.itemId === cartItem.itemId);
    if (index !== -1) {
      this.items[index].quantity += item.quantity;
      this.items[index].title = item.title;
      this.items[index].price = item.price;
      this.items[index].extra_data.updated_at = new Date().getTime();
    } else {
      this.items.push(item);
    }

    this.itemsEvent$.next({
      items: this.items,
      sendEvent: true,
    });
    this.saveData();
  }

  removeFromCart(id: string): void {
    const index: number = this.items.findIndex((item: CartItemInterface) => item.itemId === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.itemsEvent$.next({
        items: this.items,
        sendEvent: false,
      });
      this.saveData();
    }
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    const index: number = this.items.findIndex((cartItem: CartItemInterface) => cartItem.itemId === itemId);
    if (index !== -1 && this.items[index]) {
      const item: CartItemInterface = this.items[index];
      item.quantity = quantity;

      if (!item.extra_data) {
        item.extra_data = {};
      }

      item.extra_data.updated_at = new Date().getTime();

      this.saveData();
    }
  }

  // restoreDataFromStorage(): void {
  //   if (this.storageKey) {
  //     const value: string = this.sessionStorageService.retrieve(this.makeKey());
  //     if (value) {
  //       const items: NewCartItemInterface[] = JSON.parse(value);
  //       this.productsApiService
  //         .fetchProductsById(items.map((prod: NewProduct) => prod.uuid)) // TODO check why prod.itemId was here
  //         .subscribe((products: NewProduct[]) => {
  //           forEach(items, (item: NewCartItemInterface) => {
  //             const product: NewProduct = products.find((productValue: NewProduct) => {
  //               return (
  //                 productValue.uuid === item.itemId ||
  //                 !!productValue.variants.find((dd: NewProductVariant) => dd.id === item.itemId)
  //               );
  //             });
  //
  //             if (product) {
  //               const variant = product.variants.find((dd: NewProductVariant) => dd.id === item.itemId) || ({} as any);
  //               item.title = variant.title || product.title;
  //               item.price =
  //                 (variant.hidden ? variant.price : variant.salePrice) ||
  //                 (product.hidden ? product.price : product.salePrice);
  //               item.sku = variant.sku || product.sku;
  //               const image = (variant.images && variant.images[0]) || (product.images && product.images[0]);
  //               item.image = image || null;
  //             }
  //           });
  //           this.items = items;
  //           this.itemsEvent$.next({
  //             items: this.items,
  //             sendEvent: true,
  //           });
  //         });
  //     }
  //   }
  // }

  checkCartItems(): void {
    for (let i = 0; i < this.items.length; i++) {
      const item: CartItemInterface = this.items[i];
      if (item && !item.quantity) {
        this.removeFromCart(item.itemId);
        i--;
      }
    }
  }

  clearItems(): void {
    this.items = [];
    this.itemsEvent$.next({
      items: this.items,
      sendEvent: false,
    });
    this.saveData();
  }

  private saveData(): void {
    return;
    // if (this.storageKey) {
    //   this.sessionStorageService.store(this.makeKey(), JSON.stringify(this.items));
    // }
  }

  private makeKey(): string {
    const channelSet = 'TODO - WRITE HERE';

    return CART_ITEMS_KEY + channelSet + this.storageKey;
  }
}
