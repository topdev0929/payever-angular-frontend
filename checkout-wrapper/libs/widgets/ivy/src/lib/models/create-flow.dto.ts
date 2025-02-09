import { PaymentItem } from '@pe/checkout/types';

export interface FlowAddressRequestDto {
  addressLine2: string;
  city: string;
  country: string;
  countryName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  salutation: string;
  street: string;
  streetName: string;
  streetNumber: string;
  zipCode: string;
  region: string;
  organizationName: string;
  houseExtension: string;
}

export interface FlowRequestDto {
  channelSetId: string;

  channelSource?: string;
  connectionId?: string;
  apiCallId?: string;
  orderId?: string;
  amount?: number;
  downPayment?: number;
  currency?: string;
  reference?: string;
  cart?: PaymentItem[];
  billingAddress?: FlowAddressRequestDto;
  shippingAddress?: FlowAddressRequestDto;
  deliveryFee?: number;
  shippingMethodCode?: string;
  shippingMethodName?: string;
  posMerchantMode?: boolean;
  posVerifyType?: number;
  coupon?: string;
  pluginVersion?: string;
  forceLegacyCartStep?: boolean;
  forceLegacyUseInventory?: boolean;
  extra?: unknown;
  noticeUrl?: string;
  cancelUrl?: string;
  customerRedirectUrl?: unknown;
  failureUrl?: string;
  pendingUrl?: string;
  successUrl?: string;
}
