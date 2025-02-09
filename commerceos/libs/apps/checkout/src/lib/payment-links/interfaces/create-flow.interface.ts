import { AddressInterface, FlowInterface } from "@pe/checkout-types";

export interface CreateFlowParamsInterface {
  currency?: string;
  channelSetId?: string;
  clearTokens?: string;
  amount?: number;
  billingAddress?: AddressInterface;
  reference?: string;
  phoneNumber?: string;
  source?: string;
  paymentCodeId?: string;
  flowRawData?: FlowInterface;
  merchantMode?: boolean;
}
