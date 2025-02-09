import { WidgetConfigInterface, WidgetConfigPaymentInterface } from '@pe/checkout-types';

export type WidgetType = 'text-link' | 'button';
export type ButtonBorderRadiusType = 'round' | 'circle' | 'square';
export type LinkToType = 'finance_express'| 'finance_calculator' | '';
export const widgetCreatedEventMessage: string = 'financeExpressWidgetCreated';
export const paymentOptionsNotSetEventMessage: string = 'financeExpressPaymentOptionsNotSet';
export const cannotFetchPaymentOptionsEventMessage: string = 'financeExpressCannotFetchPaymentOptions';
export const cannotGetCalculationsEventMessage: string = 'cannotGetCalculationsEventMessage';
export const cannotGetConnectionIdEventMessage: string = 'cannotGetConnectionIdEventMessage';
export const swedenTokenErrorEventMessage: string = 'swedenTokenErrorEventMessage';

export interface SettingsResponseInterface {
  type: WidgetType;
  data: WidgetConfigInterface;
}

export interface PaymentsViewInterface extends WidgetConfigPaymentInterface {
  name?: string;
  icon?: string;
  selected?: boolean;
  validationLimits?: {
    min: number;
    max: number;
  };
}

export interface BaseWidgetSettingsInterface {
  type?: string;
  linkTo?: LinkToType;
  adaptiveDesign?: boolean;
  showWidgetFromPrice?: number;
  showWidgetToPrice?: number;
  showWidgetForCurrency?: string;
  visibility?: boolean;
  linkColor?: string;
  textSize?: string;
  alignment?: string;
  width?: number;
  height?: number;
  // checkoutOverlay: boolean;
  // calculatorOverlay: boolean;
}

// tslint:disable-next-line no-empty-interface
export interface TextLinkWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  // type: string;
  // link_to: null;
  // adaptive_design: boolean;
  // show_widget_from_price: number;
  // show_widget_to_price: number;
  // show_widget_for_currency: string;
  // visibility: boolean;
  // link_color: string;
  // text_size: string;
  // alignment: string;
  // width: number;
  // height: number;
}

export interface ButtonWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  textColor: string;
  textSize: string;
  corners: ButtonBorderRadiusType;
  buttonColor: string;
}

export interface BannerAndRatesWidgetSettingsInterface extends BaseWidgetSettingsInterface {
  textColor?: string;
  buttonColor?: string;
  borderColor?: string;
  size?: number;
  displayType?: 'rate' | 'banner_rate';
  labelPlacement?: string;
  order?: 'asc' | 'desc';
  bgColor?: string;
}

// tslint:disable-next-line no-empty-interface
export interface BubbleWidgetSettingsInterface extends BaseWidgetSettingsInterface {
}

export interface WidgetSettingsInterface {
  id: number;
  settings: BaseWidgetSettingsInterface[];
}

export interface OverlayAppPayloadInterface {
  button?: ButtonWidgetSettingsInterface;
  bubble?: BubbleWidgetSettingsInterface;
  calculator?: BannerAndRatesWidgetSettingsInterface;
  textLink?: TextLinkWidgetSettingsInterface;
}

export const DEFAULT_BANNER_PRICE: number = 2399.95;
