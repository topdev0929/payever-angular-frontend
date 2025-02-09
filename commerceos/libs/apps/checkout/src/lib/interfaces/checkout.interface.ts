import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { IntegrationCategory } from '@pe/shared/checkout';

import { ChannelSettingsInterface } from './channel-settings.interface';
import { SettingsPanelType } from './panel-type.enum';

export interface ColorAndStylePanelInterface {
  name: string;
  icon: string;
  key: 'businessHeader' | 'logo' | 'page' | 'button' | 'buttonSecondary' | 'input';
  // disabled ?
}

export interface CustomChannelInterface {
  title?: string;
  key?: string;
  icon?: string;
  order?: number;
  nameButton?: string;
  url?: string;
}

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  enabled: boolean;
  integration: {
    name: string,
    category: IntegrationCategory,
    displayOptions: {
      icon: string,
      title: string,
      order?: number
    },
    settingsOptions: {
      source: string,
      action?: string,
      url?: string
    },
    _id?: string,
  };
}

export interface IntegrationConnectInfoInterface {
  _id: string;
  name: string;
  category: string;
  enabled: boolean;
  extension?: {
    formAction: {
      endpoint: string,
      method: string
    },
    url: string
  };
}

export interface CheckoutConnectionInterface {
  _id: string;
  integration: string;
  name?: string;
}

export interface InstalledConnectionInterface {
  _id: string;
  integration: string;
}

export enum RegionRuleType {
  Before = 'before',
  After = 'after',
}

export interface RegionRule {
  code: string;
  type: RegionRuleType;
  targetCode: string;
  fixedPosition?: boolean;
}

export interface SectionInterface {
  code: string;
  fixed: boolean;
  enabled: boolean;
  order: number;
  excluded_channels: string[];
  subsections?: {
    _id: string,
    code: string,
    rules: {
      _id: string,
      type: string,
      property: string
      operator: string
    }[];
  }[];
  options?: {
    skipButton?: boolean;
  };
}

export interface CheckoutInterface {
  _id?: string;
  default?: boolean;
  name?: string;
  logo?: string;
  type?: string;
  testChannelSetId?: string;
  channelSettings?: ChannelSettingsInterface;
  settings?: CheckoutSettingsInterface;
  sections?: SectionInterface[];
  testingMode?: boolean;
}

export interface CheckoutChannelSetInterface {
  checkout: string;
  id: string;
  type: CheckoutChannelSetTypeEnum;
  name?: string;
  policyEnabled?: boolean;
}

export enum CheckoutChannelSetTypeEnum {
  POS = 'pos',
  SHOP = 'shop',
  LINK = 'link',
  FINANCE_EXPRESS = 'finance_express'
}

export interface CheckoutPaymentInterface {
  uuid: string;
  active?: boolean;
}

export interface SettingsMenuItemInterface {
  name?: SettingsPanelType;
  isToggleButton?: boolean;
  isHideButton?: boolean;
  isDescribe?: boolean;
  hideDescription?: boolean;
  title?: string;
  description?: string;
  listTitle?: string;
  listDescription?: string;
  nameButton?: string;
  buttonAsLink?: boolean;
  url?: string;
  icon?: string;
}

export interface CheckoutSettingsToggleInterface {
  colorAndStyle?: boolean;
  testingMode?: boolean;
  enableCustomerAccount?: boolean;
}

export interface CheckoutSettingsInterface {
  testingMode?: boolean;
  customerAccount?: any;
  policies?: any;
  styles?: StylesSettingsInterface;
  languages?: LanguageInterface[];
  cspAllowedHosts?: string[];
  phoneNumber?: string;
  message?: string;
  callbacks?: CheckoutCallbacksSettings;
  enableCustomerAccount?: boolean;
  enablePayeverTerms?: boolean;
  enableLegalPolicy?: boolean;
  enableDisclaimerPolicy?: boolean;
  enableRefundPolicy?: boolean;
  enableShippingPolicy?: boolean;
  enablePrivacyPolicy?: boolean;
}

export interface CheckoutCallbacksSettings {
    cancelUrl: string;
    failureUrl: string;
    noticeUrl: string;
    pendingUrl: string;
    successUrl: string;
}

export interface LanguageInterface {
  code: string;
  name: string;
  defaultValue: boolean;
  active: boolean;
  isDefault?: boolean;
  isToggleButton?: boolean;
  isHovered?: boolean;
}

export interface MenuListInterface extends CheckoutPaymentInterface {
  active?: boolean;
  title: string;
  icon?: string;
  isToggleButton?: boolean;
  nameButton?: string;
}

export type AlignmentType = 'left' | 'center' | 'right';

export interface StylesSettingsInterface {
  businessHeaderBackgroundColor?: string;
  businessHeaderBorderColor?: string;
  businessHeaderDesktopHeight?: string;
  businessHeaderTabletHeight?: string;
  businessHeaderMobileHeight?: string;

  businessLogoDesktopWidth?: string,
  businessLogoDesktopHeight?: string,
  businessLogoDesktopPaddingTop?: string,
  businessLogoDesktopPaddingRight?: string,
  businessLogoDesktopPaddingBottom?: string,
  businessLogoDesktopPaddingLeft?: string,
  businessLogoDesktopAlignment?: AlignmentType,

  businessLogoTabletWidth?: string,
  businessLogoTabletHeight?: string,
  businessLogoTabletPaddingTop?: string,
  businessLogoTabletPaddingRight?: string,
  businessLogoTabletPaddingBottom?: string,
  businessLogoTabletPaddingLeft?: string,
  businessLogoTabletAlignment?: AlignmentType,

  businessLogoMobileWidth?: string,
  businessLogoMobileHeight?: string,
  businessLogoMobilePaddingTop?: string,
  businessLogoMobilePaddingRight?: string,
  businessLogoMobilePaddingBottom?: string,
  businessLogoMobilePaddingLeft?: string,
  businessLogoMobileAlignment?: AlignmentType,

  buttonBackgroundColor?: string;
  buttonBackgroundDisabledColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;

  buttonSecondaryBackgroundColor?: string;
  buttonSecondaryBackgroundDisabledColor?: string;
  buttonSecondaryTextColor?: string;
  buttonSecondaryBorderRadius?: string;

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

export interface CheckoutFormInterface {
  _id?: string;
  name: string;
  logo?: string;
}

export interface SectionAvailableInterface {
  code: string;
  defaultEnabled: boolean;
  fixed: true;
  order: number;
  options?: {
    skipButton?: boolean;
  }
}

export interface IntegrationWithConnectionInterface {
  integration: IntegrationInfoInterface;
  connection: CheckoutConnectionInterface;
  event: MatSlideToggleChange;
}

export interface PaymentIntegrationInterface {
  payments: IntegrationInfoInterface[];
  connections: CheckoutConnectionInterface[];
  installedConnections: InstalledConnectionInterface[];
}

export enum WelcomeStepEnum {
  Details = 'checkoutDetails',
  Payments = 'checkoutPayments',
}
