import { PeCouponCategory } from './coupon-category.interface';
import { PeCouponCountry } from './coupon-country.interface';
import { PeCouponCustomerGroup } from './coupon-customer-group.interface';
import { PeCouponCustomer } from './coupon-customer.interface';
import { PeCouponProduct } from './coupon-product.interface';
import {
  PeCouponTypeAppliedToEnum,
  PeCouponTypeBuyXGetYBuyRequirementsTypeEnum,
  PeCouponTypeBuyXGetYGetDiscountTypesEnum,
  PeCouponTypeBuyXGetYItemTypeEnum,
  PeCouponTypeCustomerEligibilityEnum,
  PeCouponTypeEnum,
  PeCouponTypeFreeShippingTypeEnum,
  PeCouponTypeMinimumRequirementsEnum,
} from './coupon.enum';
import {BusinessInterface} from '@pe/common/micro/types/business';


export interface PeCouponLimits {
  limitOneUsePerCustomer: boolean;
  limitUsage: boolean;
  limitUsageAmount: number;
}

export interface PeCouponType {
  appliesTo?: PeCouponTypeAppliedToEnum;
  appliesToProducts?: string[] | PeCouponProduct[];
  appliesToCategories?: string[] | PeCouponCategory[];
  buyRequirementType?: PeCouponTypeBuyXGetYBuyRequirementsTypeEnum;
  buyQuantity?: number;
  buyType?: PeCouponTypeBuyXGetYItemTypeEnum;
  buyProducts?: string[] | PeCouponProduct[];
  buyCategories?: string[] | PeCouponCategory[];
  discountValue?: number;
  excludeShippingRatesOverCertainAmount?: boolean;
  excludeShippingRatesOverCertainAmountValue?: number;
  freeShippingType?: PeCouponTypeFreeShippingTypeEnum;
  freeShippingToCountries?: string[] | PeCouponCountry[];
  getType?: PeCouponTypeBuyXGetYItemTypeEnum;
  getQuantity?: number;
  getProducts?: string[] | PeCouponProduct[];
  getCategories?: string[] | PeCouponCategory[];
  getDiscountType?: PeCouponTypeBuyXGetYGetDiscountTypesEnum;
  getDiscountValue?: number;
  maxUsesPerOrder?: boolean;
  maxUsesPerOrderValue?: number;
  minimumRequirements?: PeCouponTypeMinimumRequirementsEnum;
  minimumRequirementsPurchaseAmount?: number;
  minimumRequirementsQuantityOfItems?: number;
  type: PeCouponTypeEnum;
}

export interface PeCoupon {
  _id?: string;
  businessId: string;
  code: string;
  channelSets: string[]; // channels
  customerEligibility: PeCouponTypeCustomerEligibilityEnum;
  customerEligibilityCustomerGroups: string[] | PeCouponCustomerGroup[];
  customerEligibilitySpecificCustomers: string[] | PeCouponCustomer[];
  description: string;
  endDate?: Date;
  limits: PeCouponLimits;
  name: string;
  startDate?: Date;
  status: string;
  type: PeCouponType;
}

export interface Coupon extends PeCoupon {
  [key: string]: any;
}


export interface CouponsResponse {
  data: {
    getBusiness?: BusinessInterface,
    getCoupons: {
      coupons: Coupon[];
    };
  };
}
