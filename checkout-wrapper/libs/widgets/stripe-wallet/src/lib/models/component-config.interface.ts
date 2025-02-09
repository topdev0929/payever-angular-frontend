import { CustomWidgetConfigInterface } from '@pe/checkout/types';

export interface ComponentConfig {
  amount: number;
  deliveryFee: number;
  channelSet: string;
  config: CustomWidgetConfigInterface;
  cart: PaymentItem[];
  isDebugMode: boolean;
  theme: string;
}
