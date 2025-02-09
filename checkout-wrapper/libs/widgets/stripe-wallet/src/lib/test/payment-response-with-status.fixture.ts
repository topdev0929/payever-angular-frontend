import {
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

import { paymentPayloadFixture } from './payment-payload.fixture';

export const PaymentResponseWithStatus:
  (status: PaymentStatusEnum, specificStatus: PaymentSpecificStatusEnum) => NodePaymentResponseInterface<unknown> =
  (status: PaymentStatusEnum, specificStatus: PaymentSpecificStatusEnum) => cloneDeep({
    id: 'id',
    createdAt: new Date().toString(),
    payment: {
      channel: 'link',
      shippingAddress: null,
      deliveryFee: 0,
      paymentFee: 0,
      amount: 350,
      address: {
        city: 'SomeCity',
        country: 'DE',
        email: 'customer2000@email.de',
        firstName: 'Test',
        lastName: 'Test',
        phone: '+491711238496',
        salutation: 'SALUTATION_MR',
        street: 'SomeStreet 2000',
        streetName: 'SomeStreet',
        streetNumber: '2000',
        zipCode: '12345',
      },
      apiCallId: 'api-call-id',
      businessId: 'business-id',
      businessName: 'DK',
      channelSetId: 'channel-set-id',
      currency: 'EUR',
      customerEmail: 'customer2000@email.de',
      customerName: 'Test Test',
      downPayment: 0,
      paymentType: PaymentMethodEnum.GOOGLE_PAY,
      reference: 'jfojaew23209n',
      specificStatus,
      status,
      total: 350,
    },
    paymentDetails: paymentPayloadFixture().paymentDetails,
    paymentItems: paymentPayloadFixture().paymentItems,
    options: {
      merchantCoversFee: true,
      shopRedirectEnabled: false,
    },
  });
