import {
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const PaymentResponseWithStatus:
  (status: PaymentStatusEnum, specificStatus:PaymentSpecificStatusEnum) => NodePaymentResponseInterface<any> =
  (status: PaymentStatusEnum, specificStatus: PaymentSpecificStatusEnum) => cloneDeep({
  createdAt: new Date().toString(),
  id: 'id',
  payment: {
    flowId: 'flow-id',
    deliveryFee: 0,
    paymentFee: 0,
    amount: 13000,
    address: null,
    apiCallId: 'api-call-id',
    businessId: 'business-id',
    businessName: 'SE ',
    channel: 'link',
    channelSetId: 'channel-set-id',
    currency: 'SEK',
    customerEmail: 'customer2000@email.de',
    customerName: 'Test Test',
    downPayment: 0,
    paymentType: PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
    reference: '1ayg6252265627',
    status,
    specificStatus,
    total: 13000,
    shippingAddress: null,
  },
  paymentDetails: null,
  paymentItems: [],
});
