import { AddressInterface, CartItemInterface, FlowInterface } from '@pe/checkout/types';

import { ChannelSetDeviceSettingsInterface } from './api.interface';

export interface CreateFlowParamsInterface {
  currency?: string;
  channelSetId?: string;
  clearTokens?: string;
  amount?: number;
  billingAddress?: AddressInterface;
  reference?: string;
  phoneNumber?: string;
  source?: string;
  // Works only if enabled at backend (enabled field in ChannelSetDeviceSettingsInterface)
  generatePaymentCode?: boolean;
  /**
   * @deprecated Just use merchantMode
   */
  posMerchantMode?: boolean;
  paymentCodeId?: string;
  cartIds?: string[];
  cart?: CartItemInterface[];
  flowRawData?: FlowInterface;
  merchantMode?: boolean;
}

export interface CreateFlowResultInterface {
  flow: FlowInterface;
  channelSetSettings: ChannelSetDeviceSettingsInterface;
}
