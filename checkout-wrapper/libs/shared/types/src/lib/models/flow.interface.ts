import {
  BusinessType,
  CustomerType,
  FinanceTypeEnum,
  FlowStateEnum,
  PaymentMethodEnum,
  SectionType,
} from '../enums';

import { AddressInterface } from './address.interface';
import { CartItemInterface } from './cart-item.interface';
import { FlashBagInterface } from './flash-bag.interface';
import { PaymentOptionInterface } from './payment-option.interface';
import { PaymentInterface, PaymentApiCallInterface } from './payment.interface';
import { ShippingOptionInterface } from './shipping-option.interface';

export interface LanguageSettingsInterface {
  active?: boolean;
  isDefault?: boolean;
  code?: string;
  name?: string;
}

export interface ChangePaymentDataInterface {
  redirectUrl?: string;
}

export interface AddressCompanyInterface {
  externalId: string;
  name: string;
}

export interface FlowInterface {
  amount?: number;
  apiCall?: PaymentApiCallInterface;
  billingAddress?: AddressInterface;
  businessAddressLine?: string;
  businessLogo?: string;
  businessShippingOptionId?: number;
  businessId?: string;
  businessName?: string;
  businessCountry?: string;
  businessIban?: string;
  businessType?: BusinessType;
  b2bSearch?: boolean;
  customerType?: CustomerType;
  canIdentifyBySsn?: boolean;
  callbackUrl?: string;
  cancelUrl?: string;
  cart?: CartItemInterface[];
  comment?: string;
  company?: AddressCompanyInterface;
  channel?: string;
  channelSetId?: string;
  channelSource?: string;
  channelType?: string;
  coupon?: string;
  currency?: string;
  differentAddress?: boolean;
  express?: boolean;
  extra?: any;
  failureUrl?: string;
  financeType?: FinanceTypeEnum;
  flashBag?: FlashBagInterface;
  guestToken?: string;
  hideSalutation?: boolean;
  id?: string;
  noticeUrl?: string;
  xFrameHost?: string;
  payment?: PaymentInterface; // SHOULD BE ANY or WHAT!
  connectionId?: string;
  paymentOptions?: PaymentOptionInterface[];
  pendingUrl?: string;
  /**
   * @deprecated just use merchantMode flag
   */
  pos_merchant_mode?: boolean;
  merchantMode?: boolean;

  posVerifyType?: number;
  reference?: string;
  shippingAddressId?: string;
  shippingAddresses?: AddressInterface[];
  shippingAddress?: AddressInterface;
  shippingCategory?: string;
  deliveryFee?: number;
  shippingMethodCode?: string;
  shippingMethodName?: string;
  shippingOption?: ShippingOptionInterface;

  shopUrl?: string;
  shopUserSession?: string;
  singleAddress?: boolean;
  state?: FlowStateEnum;
  successUrl?: string;
  taxValue?: number;
  total?: number; // amount + deliveryFee
  userAccountId?: number;
  values?: {[key: number]: any};
  shippingOrderId?: string;

  forceLegacyCartStep?: boolean;
  forceLegacyUseInventory?: boolean;
  down_payment?: number;
  disableValidation?: boolean;
}

export interface FlowSectionOptionsInterface {
  skipButton?: boolean;
}

export interface FlowSettingsSectionInterface {
  code: SectionType;
  fixed: boolean;
  enabled: boolean;
  order: number;
  allowed_only_channels: string[];
  excluded_channels: string[];
  excluded_integrations?: string[];
  allowed_only_integrations?: string[];
  subsections?: { code: string; }[];
  options?: FlowSectionOptionsInterface;
}

export interface CheckoutUISettingsInterface {
  uuid?: string;
  sections?: FlowSettingsSectionInterface[];
  styles?: CheckoutStyleInterface;
  logo?: string;
}

export interface CheckoutBaseSettingsInterface {
  uuid?: string;
  businessName?: string;
  businessUuid?: string;
  channelType?: string;
  companyAddress?: {
    city: string;
    country: string;
    street: string;
    zipCode: string;
  };
  currency?: string;
  // customerAccount?: {};
  languages?: LanguageSettingsInterface[];
  message?: string;
  name?: string;
  paymentMethods?: PaymentMethodEnum[];
  phoneNumber?: string;
  // policies?: {};
  testingMode?: boolean;
  customPolicy?: boolean;
  policyEnabled?: boolean;
  logo?: string;
  enableCustomerAccount?: boolean;
  enablePayeverTerms?: boolean;
  enableLegalPolicy?: boolean;
  enableDisclaimerPolicy?: boolean;
  enableRefundPolicy?: boolean;
  enableShippingPolicy?: boolean;
  enablePrivacyPolicy?: boolean;
}

export interface CheckoutSettingsInterface
  extends CheckoutBaseSettingsInterface, CheckoutUISettingsInterface {
}

export type LogoAlignmentType = 'left' | 'center' | 'right';

export interface CheckoutStyleInterface {
  businessHeaderBackgroundColor?: string;
  businessHeaderBorderColor?: string;

  businessHeaderDesktopHeight?: string | number;
  businessHeaderTabletHeight?: string | number;
  businessHeaderMobileHeight?: string | number;

  businessLogoDesktopWidth?: string | number,
  businessLogoDesktopHeight?: string | number,
  businessLogoDesktopPaddingTop?: string | number,
  businessLogoDesktopPaddingRight?: string | number,
  businessLogoDesktopPaddingBottom?: string | number,
  businessLogoDesktopPaddingLeft?: string | number,
  businessLogoDesktopAlignment?: LogoAlignmentType,

  businessLogoMobileWidth?: string | number,
  businessLogoMobileHeight?: string | number,
  businessLogoMobilePaddingTop?: string | number,
  businessLogoMobilePaddingRight?: string | number,
  businessLogoMobilePaddingBottom?: string | number,
  businessLogoMobilePaddingLeft?: string | number,
  businessLogoMobileAlignment?: LogoAlignmentType,

  businessLogoTabletWidth?: string | number,
  businessLogoTabletHeight?: string | number,
  businessLogoTabletPaddingTop?: string | number,
  businessLogoTabletPaddingRight?: string | number,
  businessLogoTabletPaddingBottom?: string | number,
  businessLogoTabletPaddingLeft?: string | number,
  businessLogoTabletAlignment?: LogoAlignmentType,


  buttonBackgroundColor?: string;
  buttonBackgroundDisabledColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;

  buttonSecondaryBackgroundColor?: string;
  buttonSecondaryBackgroundDisabledColor?: string;
  buttonSecondaryTextColor?: string;
  buttonSecondaryBorderRadius?: string;

  buttonShareBackgroundColor?: string;
  buttonShareBackgroundDisabledColor?: string;
  buttonShareTextColor?: string;
  buttonShareBorderRadius?: string;

  pageBackgroundColor?: string;
  pageLineColor?: string;
  pageTextPrimaryColor?: string;
  pageTextSecondaryColor?: string;
  pageTextLinkColor?: string;

  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputTextPrimaryColor?: string;
  inputTextSecondaryColor?: string;
  inputBorderRadius?: string;

  active?: boolean;
}

export interface FlowWithClonedMarkerInterface {
  flow: FlowInterface;
  cloneProcess: boolean;
}

export interface SectionAvailableInterface {
  code: SectionType;
  defaultEnabled: boolean;
  fixed: true;
  order: number;
}

export type FlowExtraDurationType = number | number[];
