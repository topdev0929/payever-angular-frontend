import {
  CustomWidgetConfigInterface,
  WidgetConfigInterface,
  WidgetConfigPaymentInterface,
  PaymentMethodEnum,
} from '@pe/checkout-types';

export interface ExtendedWidgetConfigInterface extends WidgetConfigInterface {
  payments?: ExtendedWidgetConfigPaymentInterface[];
  minHeight?: number;
  maxHeight?: number;
  alignment?: AlignmentEnum;
  theme?: ThemeEnum;
  isDefault?: boolean;
}

export interface ExtendedWidgetConfigPaymentInterface extends WidgetConfigPaymentInterface {
  customWidgetSetting?: Partial<ExtendedWidgetConfigInterface>
}

export enum AlignmentEnum {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}

export enum ThemeEnum {
  Light = 'light',
  Dark = 'dark',
}

export interface ExpandedCustomWidgetConfigInterface extends CustomWidgetConfigInterface {
  quoteCallbackUrl?: string;
  theme?: ThemeEnum;
  minHeight?: number;
  maxHeight?: number;
  alignment?: AlignmentEnum;
  payments?: ExtendedWidgetConfigPaymentInterface[];
  paymentSettings?: {
    [key in PaymentMethodEnum]?: Partial<WidgetConfigInterface>
  };
  previewPayment?: PaymentMethodEnum;
  isDefault?: boolean;
}
export interface WidgetElementInterface {
  config: ExpandedCustomWidgetConfigInterface;
  root: HTMLElement;
  elem: HTMLElement;
  paymentMethod: PaymentMethodEnum;
  initialHTML: string;
  mutationObserver: MutationObserver;
}
