import { PaymentMethodEnum } from '../../enums';
import {
  CheckoutModeEnum,
  CheckoutPlacementEnum,
  RatesOrderEnum,
  WidgetTypeEnum,
} from '../enums';

import { PaymentItem } from './payment-payload.interface';

export interface WidgetConfigPaymentInterface {
  paymentMethod?: PaymentMethodEnum;
  amountLimits?: {
    min: number;
    max: number;
  };
  isBNPL?: boolean; // To differ NO/DK/SE payment: Regular Installments or Buy now pay later
  productId?: string; // Som kind of hack for DK
  enabled?: boolean;
  customWidgetSetting?: Partial<WidgetConfigInterface>;
}

export interface WidgetConfigStylesInterface {
  backgroundColor: string; // of box around widget. Default color: white
  lineColor: string; // around box around widget. Default color: white
  mainTextColor: string; // the text that goes „pay xx€ for xy months“. Default color: black

  // the interest rates etc. Default color: black
  // (Note: if possible please forbid same color for background and color of regulatory text, so no white on white)
  regularTextColor: string;

  ctaTextColor: string; // for "Checkout with finance express >" link
  buttonColor: string; // Button widget
  fieldBackgroundColor: string; // Calculator widget
  fieldLineColor: string; // Calculator widget
  fieldArrowColor: string; // Calculator widget
  headerTextColor: string; // Calculator widget
}

export interface WidgetConfigInterface {

  _id?: string;
  checkoutId?: string;
  channelSet?: string; // Filled at Backend, we can't change

  amountLimits?: {
    min: number;
    max: number;
  };
  type?: WidgetTypeEnum;
  isVisible?: boolean;
  payments?: WidgetConfigPaymentInterface[];
  ratesOrder?: RatesOrderEnum;
  styles?: WidgetConfigStylesInterface;

  minWidth?: number; // For all
  maxWidth?: number; // For all
  maxHeight?: number; // For apple/google
  minHeight?: number; // For apple/google
  checkoutPlacement?: CheckoutPlacementEnum;
  checkoutMode?: CheckoutModeEnum;
  // For finance express when create flow:
  successUrl?: string;
  pendingUrl?: string;
  cancelUrl?: string;
  failureUrl?: string;
  noticeUrl?: string;
  quoteCallbackUrl?: string;
  cart?: PaymentItem[];
  previewPayment?: PaymentMethodEnum;
  iframeMode?: boolean;
}
