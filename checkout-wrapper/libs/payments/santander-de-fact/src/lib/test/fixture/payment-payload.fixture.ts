import { NodePaymentInterface } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';


import { flowWithPaymentOptionsFixture } from './flow-with-payment-options.fixture';

export const paymentPayload: () => NodePaymentInterface<any> = () => cloneDeep<NodePaymentInterface<any>>({
  payment: {
    flowId: flowWithPaymentOptionsFixture().id,
    reference: flowWithPaymentOptionsFixture().reference,
    total: flowWithPaymentOptionsFixture().total,
    amount: flowWithPaymentOptionsFixture().amount,
    currency: flowWithPaymentOptionsFixture().currency,
    customerName: `${flowWithPaymentOptionsFixture().billingAddress?.firstName} ${flowWithPaymentOptionsFixture().billingAddress?.lastName}`.trim(),
    customerEmail: flowWithPaymentOptionsFixture().billingAddress?.email,
    businessId: flowWithPaymentOptionsFixture().businessId,
    businessName: flowWithPaymentOptionsFixture().businessName,
    deliveryFee: flowWithPaymentOptionsFixture().deliveryFee || 0,
    shippingOrderId: flowWithPaymentOptionsFixture().shippingOrderId,
    shippingMethodName: flowWithPaymentOptionsFixture().shippingMethodName,
    apiCallId: flowWithPaymentOptionsFixture().apiCall?.id,
    channel: flowWithPaymentOptionsFixture().channel,
    channelSetId: flowWithPaymentOptionsFixture().channelSetId,
    channelSource: flowWithPaymentOptionsFixture().channelSource,
    channelType: flowWithPaymentOptionsFixture().channelType,
    address: {
      city: null,
      country: null,
      email: null,
      firstName: null,
      lastName: null,
      phone: null,
      salutation: null,
      street: null,
      streetName: null,
      streetNumber: '',
      zipCode: null,
    },
  },
  paymentItems: [],
  paymentDetails: null,
});
