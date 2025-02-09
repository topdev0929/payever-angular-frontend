import { Injectable, Injector } from '@angular/core';

import { MediaApiService } from '@pe/checkout/api/media';
import { ProductInterface, ProductTypes } from '@pe/checkout/products';
import { AddressInterface, FlowInterface } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';

import {
  ShippingAddressInterface,
  ShippingCartProduct,
  ShippingResponseInterface,
  NormilizedShippingInterface,
  WeightUnitEnum,
  DimensionUnitEnum,
} from '../types';

@Injectable()
export class ShippingConverterService {

  private mediaService = this.injector.get(MediaApiService);
  private currencyPipe = this.injector.get(PeCurrencyPipe);

  constructor(protected injector: Injector) {}

  getCartItemIdsFromFlow(flow: FlowInterface): string[] {
    return (flow.cart || []).map(item => item.productId);
  }

  convertFlowAddressToShippingAddress(address: AddressInterface): ShippingAddressInterface {
    const result: ShippingAddressInterface = {
      name: `${address.salutation || ''} ${address.firstName || ''} ${address.lastName || ''}`.trim(),
      streetName: address.streetName || address.street,
      streetNumber: address.streetNumber || '',
      city: address.city,
      stateProvinceCode: '',
      zipCode: address.zipCode,
      countryCode: address.country,
      phone: address.phone || address.mobilePhone,
    };

    return result;
  }

  convertFlowCartToShippingProducts(flow: FlowInterface, products: ProductInterface[]): ShippingCartProduct[] {
    const result: ShippingCartProduct[] = [];
    (flow.cart || []).forEach((cartItem) => {
      const product: ProductInterface = products.find(p =>
        p.id === cartItem.productId
          || !!(p.variants || []).find(pp => pp.id === cartItem.productId)
      );
      if (product?.shipping && product.type === ProductTypes.Physical) {
        const shippingProduct: ShippingCartProduct = {
          uuid: cartItem.productId,
          productId: cartItem.productId,
          quantity: cartItem.quantity || 0,
          name: cartItem.name || '---',
          image: product.images?.length
            ? this.mediaService.getMediaUrl(product.images[0], 'products')
            : null,
          currency: flow.currency,
          price: cartItem.price || 0,
          weight: parseFloat(product.shipping.weight),
          width: parseFloat(product.shipping.width),
          length: parseFloat(product.shipping.length),
          height: parseFloat(product.shipping.height),
          weightUnit: WeightUnitEnum.kg,
          dimensionUnit: DimensionUnitEnum.cm,
        };
        result.push(shippingProduct);
      }
    });

    return result;
  }

  convertShippingToNormilized(data: ShippingResponseInterface, currency: string): NormilizedShippingInterface[] {
    const result: NormilizedShippingInterface[] = [];
    data.methods.forEach((method) => {
      const desc: string = this.formatDescription(method.rate, currency);
      result.push({
        icon: method.icon,
        title: method.name,
        // title: this.translateService.translate(`checkout_shipping_types.${method.name}.title`),
        description: desc,
        shippingOrderId: data.shippingOrderId,
        integrationSubscriptionId: method.integrationSubscriptionId,
        saveData: {
          // shipping_category: 'custom',
          // shipping_option_name: method.integrationRule.type.name,
          shippingMethodName: method.name,
          shippingFee: method.rate,
        },
      });
    });

    return result;
  }

  private formatDescription(price: number, currency: string, translationKey: string = null): string {
    const priceText = this.currencyPipe.transform(price, currency, 'symbol');
    let result = priceText;
    if (translationKey) {
      result = `${translationKey}${price}`;
    }

    return result;
  }
}
