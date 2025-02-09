import { ChannelSettingsInterface } from './channel-settings.interface';
import { SettingsPanelType } from './panel-type.enum';
import { IntegrationCategory } from '@pe/finexp-app';

export interface ColorAndStylePanelInterface {
  name: string;
  icon: string;
  key: 'businessHeader' | 'page' | 'button' | 'input';
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

export { IntegrationCategory } from '@pe/finexp-app';

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
  // paymentList?: CheckoutPaymentInterface[];
  // integrationsList?: CheckoutPaymentInterface[]; // TODO why CheckoutPaymentInterface
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

export interface ChecktouSettingsToggleInterface {
  colorAndStyle?: boolean;
  testingMode?: boolean;
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
/*
export interface InstalledAppsInterface {
  title: string;
  type: string;
  icon: string;
  uuid: string;
  nameButton?: string;
  isToggleButton?: boolean;
  active?: boolean;
}

export interface InstalledAppsIntegrationInterface extends InstalledAppsInterface {
  integrationName: string;
  integrationCategory: string;
}
*/
export interface MenuListInterface extends CheckoutPaymentInterface {
  active?: boolean;
  title: string;
  icon?: string;
  isToggleButton?: boolean;
  nameButton?: string;
}

export interface StylesSettingsInterface {
  businessHeaderBackgroundColor?: string;
  businessHeaderBorderColor?: string;
  businessHeaderDesktopHeight?: number;
  businessHeaderMobileHeight?: number;

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
}

export interface IntegrationWithConnectionInterface {
  integration: IntegrationInfoInterface;
  connection: CheckoutConnectionInterface;
}

export enum WelcomeStepEnum {
  Details = 'checkoutDetails',
  Payments = 'checkoutPayments',
}
