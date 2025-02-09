import {
  NodePaymentBaseInterface,
  NodePaymentCartItemInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

export interface NodeFlowDataInterface<PaymentDetailsOrFormToken, PaymentResponseDetails> {
  channelSetId: string;
  connectionId: string;
  guestToken: string;
  base: NodePaymentBaseInterface;
  items: NodePaymentCartItemInterface[];
  paymentsData: {[key in PaymentMethodEnum]?: PaymentDetailsOrFormToken};
  response: NodePaymentResponseInterface<PaymentResponseDetails>;
}
