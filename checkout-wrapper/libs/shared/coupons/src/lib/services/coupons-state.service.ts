import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { FlowState, PatchFlow } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { CouponsApiService } from './coupons-api.service';

@Injectable()
export class CouponsStateService {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  constructor(
    private store: Store,
    private apiService: CouponsApiService,
  ) {}

  updateCoupon(coupon: string = null): Observable<void> {
    const { businessId, cart } = this.flow;
    const shippingAddress = this.flow.shippingAddress || this.flow.billingAddress;
    const cartWithoutCoupon = cart.map(item => ({
      ...item,
      originalPrice: item.price,
    }));

    return this.apiService.requestCouponData(
      businessId,
      coupon,
      cartWithoutCoupon,
      shippingAddress?.country,
      {
        email: shippingAddress?.email,
        name: `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim(),
      },
    ).pipe(
      switchMap((codeData) => {
        const amount = codeData.cart.reduce((acc, item) => acc += item.quantity * item.price && acc, 0);

        return this.store.dispatch(
          new PatchFlow({
            cart: codeData.cart,
            amount,
            coupon,
          })
        );
      }),
    );
  }

  removeCoupon(): Observable<void> {
    const { cart } = this.flow;

    let amount = 0;
    const updatedCart = cart.map((item) => {
      amount += item.price * item.quantity;

      return { ...item, originalPrice: item.price };
    });

    return this.store.dispatch(new PatchFlow({ cart: updatedCart, coupon: null, amount }));
  }
}
