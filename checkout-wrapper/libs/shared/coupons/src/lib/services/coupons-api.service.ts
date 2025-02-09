import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CartItemInterface } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import { CouponInterface } from '../types';

@Injectable()
export class CouponsApiService {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private httpClient: HttpClient
  ) {
  }

  requestCouponData(
    businessId: string,
    couponCode: string,
    cart: CartItemInterface[],
    shippingCountryCode: string,
    customerDetails: { name: string, email: string }
  ): Observable<CouponInterface> {
    return this.httpClient.post<CouponInterface>(
      `${this.env.backend.coupons}/business/${businessId}/coupons/apply-coupon`,
      {
        couponCode,
        cart,
        ...(shippingCountryCode ? { shippingCountry: shippingCountryCode } : {}),
        customer: customerDetails,
      }
    );
  }
}
