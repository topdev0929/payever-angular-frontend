import { CartItemInterface } from '@pe/checkout/types';

export interface CouponInterface {
  cart: CartItemInterface[];
  appliedOn: {
    identifier: string,
    reduction: number
  }[];
}
