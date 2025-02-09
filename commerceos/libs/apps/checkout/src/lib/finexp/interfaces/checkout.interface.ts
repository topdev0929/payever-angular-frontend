import { IntegrationCategory } from '@pe/shared/checkout';

import { ChannelSettingsInterface } from './channel-settings.interface';

export interface InstalledConnectionInterface {
  _id: string;
  integration: string;
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
    }
  };
}

export interface CustomChannelInterface {
  title?: string;
  key?: string;
  icon?: string;
  nameButton?: string;
  url?: string;
}

export interface CheckoutConnectionInterface {
  _id: string;
  integration: string;
  name?: string;
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
  type: string;
  name?: string;
  policyEnabled?: boolean;
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

export interface StylesSettingsInterface {
  businessHeaderBackgroundColor?: string;
  businessHeaderBorderColor?: string;

  buttonBackgroundColor?: string;
  buttonBackgroundDisabledColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;

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

export interface SectionAvailableInterface {
  code: string;
  defaultEnabled: boolean;
  fixed: true;
  order: number;
}
