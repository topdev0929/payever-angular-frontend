import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ImitateHttp } from './imitate-http.decorator';

export const SANDBOX_COUPONS = [
  {
    appliesToCategories: [],
    appliesToProducts: [],
    channelSetsIds: [],
    code: 'BR9M5UBVK33P',
    contacts: [],
    customerEligibilityCustomerGroups: [],
    customerEligibilitySpecificCustomers: [],
    description: 'a new description',
    endDate: '2021-06-04T19:00:00.000Z',
    isAutomaticDiscount: false,
    limits: {
      _id: '5fb63bffb52590001171e0a7',
      limitOneUsePerCustomer: true,
      limitUsage: true,
      limitUsageAmount: 200,
    },
    name: 'nameValue',
    products: [],
    startDate: '2021-05-04T19:00:00.000Z',
    status: 'INACTIVE',
    type: {
      type: 'PERCENTAGE',
      discountValue: 5,
      appliesTo: 'ALL_PRODUCTS'
    },
    __v: 0,
    _id: '40f023f3-06a0-40e3-b04a-a21203df3a4b',
  },
];


@Injectable({ providedIn: 'root' })
export class SandboxMockCouponsBackend {

  @ImitateHttp()
  getCouponsList() {
    return of(SANDBOX_COUPONS);
  }

  @ImitateHttp()
  getCouponById(couponId) {
    return of(SANDBOX_COUPONS.find(coupon => coupon._id === couponId) ?? SANDBOX_COUPONS[0]);
  }
}
