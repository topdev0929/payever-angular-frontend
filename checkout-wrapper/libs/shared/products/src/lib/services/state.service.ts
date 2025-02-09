import { Location } from '@angular/common';
import { Injectable, Injector, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';

import { CartItemInterface, CartItemExInterface, CheckoutBaseSettingsInterface } from '@pe/checkout/types';
import { CustomConfigInterface, PE_ENV } from '@pe/common/core';

import { ProductInterface, ProductVariantInterface } from '../types';

import { ProductsApiService } from './api.service';

interface StateInterface {
  subject: BehaviorSubject<ProductInterface>;
  processed: boolean;
}

enum MediaUrlTypeEnum {
  Regular = 'regular',
  Thumbnail = 'thumbnail',
  GridThumbnail = 'grid-thumbnail',
  Blurred = 'blurred',
  BlurredThumbnail = 'blurred-thumbnail'
}

@Injectable({
  providedIn: 'root',
})
export class ProductsStateService {

  private apiService: ProductsApiService = this.injector.get(ProductsApiService);
  private env = inject(PE_ENV);

  private products: {[key: string]: StateInterface} = {};

  constructor(
    private injector: Injector
  ) {
  }

  getProduct(id: string, reset = false): Observable<ProductInterface> {
    if (!this.products[id]) {
      this.products[id] = {
        subject: new BehaviorSubject<ProductInterface>(null),
        processed: false,
      };
    }
    const ref: StateInterface = this.products[id];
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);

      this.apiService.getProducts([id]).pipe(catchError(() => of([]))).subscribe(
        (products) => {
          ref.subject.next(products[0]);
        },
        () => {
          ref.processed = false;
        }
      );
    }

    return ref.subject.asObservable();
  }

  getProductOnce(id: string, reset = false): Observable<ProductInterface> {
    return this.getProduct(id, reset).pipe(filter(d => !!d), take(1));
  }

  getProducts(ids: string[], reset = false): Observable<ProductInterface[]> {
    if (!ids || ids.length === 0) { return of([]) }
    let processed = true;
    const subjects: BehaviorSubject<ProductInterface>[] = [];
    ids.forEach((id) => {
      if (!this.products[id]) {
        this.products[id] = {
          subject: new BehaviorSubject<ProductInterface>(undefined),
          processed: false,
        };
      }
      subjects.push(this.products[id].subject);
      if (!this.products[id].processed) {
        processed = false;
      }
    });
    if (!processed || reset) {
      ids.forEach((id) => {
        const ref: StateInterface = this.products[id];
        ref.processed = true;
        ref.subject.next(undefined);
      });

      this.apiService.getProducts(ids).pipe(catchError(() => of([]))).subscribe(
        (products: ProductInterface[]) => {
          ids.forEach((id) => {
            const ref: StateInterface = this.products[id];
            const pr: ProductInterface = products.find(p => p.id === id || !!p.variants.find(v => v.id === id));
            if (pr) {
              ref.subject.next(pr);
            } else {
              ref.subject.next({} as any);
            }
            ref.processed = false;
          });
        },
        () => {
          ids.forEach((id) => {
            const ref: StateInterface = this.products[id];
            ref.subject.next(null);
            ref.processed = false;
          });
        }
      );
    }

    return combineLatest(subjects);
  }

  getProductsOnce(ids: string[], reset = false): Observable<ProductInterface[]> {
    return this.getProducts(ids, reset).pipe(
      filter(products => products.filter(p => p === undefined).length === 0),
      take(1),
    );
  }

  cartItemsToExtended(
    data: ProductInterface[],
    cart: CartItemInterface[],
    flowSettings: CheckoutBaseSettingsInterface,
  ): CartItemExInterface[] {
    const result: CartItemExInterface[] = [];
    cart.forEach((oldItem: CartItemInterface) => {
      const item: CartItemExInterface = {
        ...oldItem,
        options: oldItem?.options,
        extraData: { ...oldItem?.extraData },
      };
      result.push(item);
      const full: ProductInterface = data.find(d => (d && d.id === item.productId)
        || !!(d?.variants ? d.variants : []).find(dd => dd && dd.id === item.productId));

      if (full && Object.keys(full).length) {
        const variant: ProductVariantInterface = (full.variants || []).find(dd => dd.id === item.productId)
          || {} as any;

        item.name = full.title || item.name;
        item._optionsAsLine = this.makeVariantTitle(variant);
        if (!item.price) { // If discount was applied via coupon we should not refresh price
          item.price = (!variant.onSales
            ? variant.price
            : variant.salePrice)
              || (!full.onSales
                ? full.price
                : full.salePrice)
                || item.price;
        }
        item.vat = item.vat || 0;
        item.sku = variant.sku || full.sku;
        item.identifier = variant.id || full.id || item.identifier;
        if (!item.id) { // Small fix for case if id is missing
          item.id = item.productId || item.identifier;
        }
        item.options = variant.options;
        const image: string = variant.images?.[0] || full.images?.[0];
        item.image = image ? this.getMediaUrl(image, 'products') : item.image;
        if (this.checkIsShop(flowSettings)) {
          item.vat = full.vatRate;
        }
      } else if (item.image && !this.isURL(item.image)) {
        // Kind of hack when we have only image name
        item.image = this.getMediaUrl(item.image, 'products');
      }
    });

    return result;
  }

  makeVariantTitle(variant: ProductVariantInterface): string {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return variant.options?.length ? variant.options.map(a => `${capitalize(a.name)}: ${a.value}`).join(', ') : null;
  }

  private checkIsShop(flowSettings: CheckoutBaseSettingsInterface): boolean {
    return flowSettings && flowSettings.channelType === 'shop';
  }

  private isURL(str: string): boolean {
    return str && (str.startsWith('http://') || str.startsWith('https://'));
  }

  /**
   * @deprecated
   * Remove when circ dep fixed and use @pe/checkout/media
   */
  private getMediaUrl(blob: string, container: string, type: MediaUrlTypeEnum = null, size: string = null): string {
    if (!blob) {
      return blob;
    }
    if (blob.startsWith('http://') || blob.startsWith('https://')) {
      return blob;
    }
    type = type || MediaUrlTypeEnum.Regular;
    const containerUrlPart: string = size ? `${container}:${size}` : container;
    const config: CustomConfigInterface = this.env.custom;
    const baseUrlNormalized: string = Location.stripTrailingSlash(config.storage);

    // NOTE: Suffixes '-thumbnail' and '-blurred' are set y media micro (NOT FOR ALL BLOB CONTAINERS!)
    const blobName: string = ['regular', ''].indexOf(type) >= 0 ? blob : `${blob}-${type}`;

    const blobEncoded: string = encodeURIComponent(blobName).replace('(', '%28').replace(')', '%29');

    return `${baseUrlNormalized}/${containerUrlPart}/${blobEncoded}`;
  }
}
