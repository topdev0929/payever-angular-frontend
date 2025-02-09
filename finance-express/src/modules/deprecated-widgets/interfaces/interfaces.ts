import {
  AbstractWidget,
  BannerAndRateWidgetGeneral,
  BubbleWidget,
  BubblePreviewWidget,
  ButtonWidget,
  Overlay,
  TextLinkWidget
} from '../classes';

export interface PayeverInterface {
  FinanceExpress: FinanceExpressInterface;
  Overlay: typeof Overlay; // TODO make interface
  AbstractWidget: any;
}

export interface FinanceExpressInterface {
  AbstractWidget: typeof AbstractWidget;
  BannerAndRateWidgetGeneral: typeof BannerAndRateWidgetGeneral;
  BannerAndRateWidget: typeof BannerAndRateWidgetGeneral;
  BubbleWidget:  typeof BubbleWidget | typeof BubblePreviewWidget;
  ButtonWidget: typeof ButtonWidget;
  TextLinkWidget: typeof TextLinkWidget;
  Embed: any;
  paymentOptionsEnabled: boolean;
  embedInstance: EmbedInterface;
  script: any;
}

export interface PhrasesInterface {
  monthly_amount: any;
  bubble_close: string;
  installment_checkout: string;
  payback_period: string;
  finance_calculator?: any;
  overlay_title?: any;
  bubble_finance_calculator?: any;
  bubble_finance_express?: any;
}

export interface SwedenTokenDataResponse {
  tokenData: {
    token: string;
  }
}

export interface EmbedInterface {
  phrases: PhrasesInterface;
  setSettings(settings: any): void;
  isSe: boolean;
  isNo: boolean;
  swedenToken: string;
  // static instance(): EmbedInterface;
}
