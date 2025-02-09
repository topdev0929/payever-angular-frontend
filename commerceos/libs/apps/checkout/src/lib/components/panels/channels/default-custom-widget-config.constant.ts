import {
  CheckoutModeEnum,
  CheckoutPlacementEnum,
  CustomWidgetConfigInterface,
  RatesOrderEnum,
} from '@pe/checkout-types';

export const defaultCustomWidgetConfig: CustomWidgetConfigInterface = {

  channelSet: null,

  amountLimits: {
    min: null,
    max: null,
  },
  isVisible: true,
  payments: [],
  ratesOrder: RatesOrderEnum.Asc,
  styles: {
    backgroundColor: '#ffffff',
    lineColor: '#eeeeee',
    mainTextColor: '#333333',
    regularTextColor: '#333333',
    ctaTextColor: '#333333',
    buttonColor: '#e8e8e8',
    fieldBackgroundColor: '#ffffff',
    fieldLineColor: '#e8e8e8',
    fieldArrowColor: '#555555',
    headerTextColor: '#888888',
  },

  minWidth: null,
  maxWidth: null,
  checkoutPlacement: CheckoutPlacementEnum.RighSidebar,
  checkoutMode: CheckoutModeEnum.None,

  successUrl: null,
  pendingUrl: null,
  cancelUrl: null,
  failureUrl: null,
  noticeUrl: null,

  business: null,
  checkoutId: null,
  widgetId: null,
  amount: null,
  reference: null,
  cart: null,
  type: null,
  isDebugMode: null,
};
